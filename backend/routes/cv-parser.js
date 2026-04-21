const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const mammoth = require('mammoth');

// pdf-parse exports PDFParse class
const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule.PDFParse;

// Configure multer for CV uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/temp');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `cv-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOCX, DOC, and TXT files are allowed'));
        }
    }
});

// Extract text from different file types
async function extractText(filePath, fileType) {
    try {
        if (fileType === '.pdf') {
            const dataBuffer = await fs.readFile(filePath);
            // pdf-parse v2.x requires Uint8Array, not Buffer
            const uint8Array = new Uint8Array(dataBuffer);
            const parser = new PDFParse(uint8Array);
            await parser.load(); // Load the PDF first
            const textData = await parser.getText(); // Returns array of text objects

            console.log('PDF getText() result:', typeof textData, Array.isArray(textData));

            // getText() returns an array of text objects, need to extract and join
            let text = '';
            if (Array.isArray(textData)) {
                text = textData.map(item => item.text || item.str || item).join(' ');
            } else if (typeof textData === 'string') {
                text = textData;
            } else if (textData && textData.text) {
                text = textData.text;
            }

            console.log('PDF extracted text length:', text ? text.length : 0);
            console.log('PDF extracted text preview:', text ? text.substring(0, 200) : 'NO TEXT');
            return text || '';
        } else if (fileType === '.docx' || fileType === '.doc') {
            const result = await mammoth.extractRawText({ path: filePath });
            console.log('DOCX extracted text length:', result.value ? result.value.length : 0);
            return result.value || '';
        } else if (fileType === '.txt') {
            const text = await fs.readFile(filePath, 'utf-8');
            console.log('TXT extracted text length:', text.length);
            return text;
        }
        return '';
    } catch (error) {
        console.error('Text extraction error:', error);
        throw error; // Re-throw to get more details in the route handler
    }
}

// Parse CV text and extract fields
function parseCV(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const lowerText = text.toLowerCase();

    // Initialize extracted data
    const extracted = {
        firstName: '',
        lastName: '',
        emailAddress: '',
        contactNumber: '',
        city: '',
        jobTitle: '',
        industry: '',
        professionalSummary: '',
        workExperience: '',
        expectedSalary: '',
        skills: '',
        education: '',
        dateOfBirth: '',
        nationality: '',
        maritalStatus: '',
        previousEmployers: []
    };

    console.log('Parsing CV with', lines.length, 'lines of text');

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
        extracted.emailAddress = emails[0];
        console.log('Found email:', extracted.emailAddress);
    }

    // Extract phone number (improved regex for international formats)
    const phoneRegex = /(?:\+?[\d\s\-\(\)]{10,20})/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
        // Filter to get most likely phone number
        const validPhone = phones.find(p => p.replace(/\D/g, '').length >= 10);
        if (validPhone) {
            extracted.contactNumber = validPhone.trim();
            console.log('Found phone:', extracted.contactNumber);
        }
    }

    // Extract name (first non-empty line that doesn't contain email/phone)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        if (!line.match(emailRegex) && !line.match(phoneRegex) && line.length > 3 && line.length < 50) {
            const nameParts = line.split(' ').filter(part => part.length >= 2 && /^[A-Za-z]+$/.test(part));
            if (nameParts.length >= 2) {
                extracted.firstName = nameParts[0];
                extracted.lastName = nameParts.slice(1).join(' ');
                console.log('Found name:', extracted.firstName, extracted.lastName);
                break;
            }
        }
    }

    // Extract city (improved patterns)
    const cityPatterns = [
        /(?:City|Location|Address|Based in):?\s*([A-Za-z\s]+)/i,
        /,\s*([A-Za-z\s]{3,20}),/,
        /\b(Johannesburg|Cape Town|Durban|Pretoria|Port Elizabeth|Bloemfontein|Pietermaritzburg|East London|Kimberley|Polokwane|Nelspruit|Rustenburg)\b/i
    ];
    for (const pattern of cityPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            extracted.city = match[1].trim();
            console.log('Found city:', extracted.city);
            break;
        }
    }

    // Extract current job title (look for title near the top, after name)
    const titleKeywords = [
        'Developer', 'Engineer', 'Manager', 'Designer', 'Analyst', 'Consultant',
        'Specialist', 'Director', 'Coordinator', 'Administrator', 'Officer',
        'Accountant', 'Programmer', 'Architect', 'Technician', 'Assistant',
        'Lead', 'Senior', 'Junior', 'Principal', 'Chief', 'Head', 'VP', 'President'
    ];

    for (let i = 0; i < Math.min(15, lines.length); i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        // Skip lines that are clearly not job titles
        if (line.match(emailRegex) || line.match(phoneRegex) || line.length > 100) continue;

        // Check if line contains job keywords
        const hasJobKeyword = titleKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()));
        if (hasJobKeyword && line.length < 80) {
            extracted.jobTitle = line;
            console.log('Found job title:', extracted.jobTitle);
            break;
        }
    }

    // Industry / sector from labeled lines (e.g. "Industry: Banking")
    const industryLine = text.match(
        /(?:^|[\r\n])\s*(?:industry|sector|field)\s*[:\-–]\s*([^\r\n]+)/i
    );
    if (industryLine && industryLine[1]) {
        extracted.industry = industryLine[1].trim().substring(0, 200);
        console.log('Found industry:', extracted.industry);
    }

    // Extract professional summary/objective (excluding personal profile)
    const summaryKeywords = ['summary', 'profile', 'objective', 'about', 'introduction', 'overview'];
    const excludeKeywords = ['personal profile', 'personal information', 'personal details', 'father name', 'cnic', 'date of birth'];
    let summaryStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();

        // Skip if it's a personal profile section
        if (excludeKeywords.some(keyword => lowerLine.includes(keyword))) {
            continue;
        }

        // Look for professional summary keywords
        if (summaryKeywords.some(keyword => lowerLine.includes(keyword) && lowerLine.length < 50)) {
            summaryStartIndex = i + 1;
            break;
        }
    }

    if (summaryStartIndex !== -1) {
        const endKeywords = ['experience', 'employment', 'education', 'skills', 'work history', 'personal profile', 'personal information'];
        let summaryEndIndex = summaryStartIndex + 10; // Default to 10 lines

        for (let i = summaryStartIndex; i < lines.length; i++) {
            const lowerLine = lines[i].toLowerCase();
            if (endKeywords.some(keyword => lowerLine.includes(keyword) && lowerLine.length < 50)) {
                summaryEndIndex = i;
                break;
            }
        }

        const summaryLines = lines.slice(summaryStartIndex, Math.min(summaryEndIndex, summaryStartIndex + 10));

        // Filter out lines that look like personal details
        const filteredSummary = summaryLines.filter(line => {
            const lowerLine = line.toLowerCase();
            return !lowerLine.includes('father name') &&
                !lowerLine.includes('date of birth') &&
                !lowerLine.includes('cnic') &&
                !lowerLine.includes('nationality') &&
                !lowerLine.includes('religion') &&
                !lowerLine.includes('marital status') &&
                line.length > 10; // Skip very short lines
        });

        extracted.professionalSummary = filteredSummary.join(' ').substring(0, 500); // Limit to 500 chars
        console.log('Found summary:', extracted.professionalSummary.substring(0, 100) + '...');
    }

    // Extract personal details (DOB, nationality, marital status, etc.)
    // Date of Birth
    const dobPatterns = [
        /(?:Date of Birth|DOB|Born):?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
        /(?:Date of Birth|DOB|Born):?\s*(\d{1,2}\s+\w+\s+\d{4})/i
    ];
    for (const pattern of dobPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            extracted.dateOfBirth = match[1].trim();
            console.log('Found DOB:', extracted.dateOfBirth);
            break;
        }
    }

    // Nationality
    const nationalityPattern = /(?:Nationality):?\s*([A-Za-z]+)/i;
    const nationalityMatch = text.match(nationalityPattern);
    if (nationalityMatch && nationalityMatch[1]) {
        extracted.nationality = nationalityMatch[1].trim();
        console.log('Found nationality:', extracted.nationality);
    }

    // Marital Status
    const maritalPattern = /(?:Marital Status):?\s*([A-Za-z]+)/i;
    const maritalMatch = text.match(maritalPattern);
    if (maritalMatch && maritalMatch[1]) {
        extracted.maritalStatus = maritalMatch[1].trim();
        console.log('Found marital status:', extracted.maritalStatus);
    }

    // Extract work experience
    const experienceKeywords = ['experience', 'employment', 'work history', 'professional background', 'career'];
    let experienceStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();
        if (experienceKeywords.some(keyword => lowerLine.includes(keyword) && lowerLine.length < 50)) {
            experienceStartIndex = i + 1;
            break;
        }
    }

    if (experienceStartIndex !== -1) {
        const endKeywords = ['education', 'skills', 'references', 'certification', 'languages', 'hobbies'];
        let experienceEndIndex = lines.length;

        for (let i = experienceStartIndex; i < lines.length; i++) {
            const lowerLine = lines[i].toLowerCase();
            if (endKeywords.some(keyword => lowerLine.includes(keyword) && lowerLine.length < 50)) {
                experienceEndIndex = i;
                break;
            }
        }

        const experienceLines = lines.slice(experienceStartIndex, Math.min(experienceEndIndex, experienceStartIndex + 20));
        extracted.workExperience = experienceLines.join('\n');
        console.log('Found work experience:', experienceLines.length, 'lines');
    }

    // Extract skills
    const skillsKeywords = ['skills', 'technical skills', 'competencies', 'expertise'];
    let skillsStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();
        if (skillsKeywords.some(keyword => lowerLine.includes(keyword) && lowerLine.length < 50)) {
            skillsStartIndex = i + 1;
            break;
        }
    }

    if (skillsStartIndex !== -1) {
        const endKeywords = ['experience', 'education', 'references', 'certification', 'languages'];
        let skillsEndIndex = skillsStartIndex + 10;

        for (let i = skillsStartIndex; i < lines.length; i++) {
            const lowerLine = lines[i].toLowerCase();
            if (endKeywords.some(keyword => lowerLine.includes(keyword) && lowerLine.length < 50)) {
                skillsEndIndex = i;
                break;
            }
        }

        const skillsLines = lines.slice(skillsStartIndex, Math.min(skillsEndIndex, skillsStartIndex + 10));
        extracted.skills = skillsLines.join(', ');
        console.log('Found skills:', extracted.skills.substring(0, 100) + '...');
    }

    // Extract education
    const educationKeywords = ['education', 'qualification', 'academic', 'degree', 'university', 'college'];
    let educationStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase();
        if (educationKeywords.some(keyword => lowerLine.includes(keyword) && lowerLine.length < 50)) {
            educationStartIndex = i + 1;
            break;
        }
    }

    if (educationStartIndex !== -1) {
        const endKeywords = ['experience', 'skills', 'references', 'certification', 'languages', 'hobbies'];
        let educationEndIndex = educationStartIndex + 10;

        for (let i = educationStartIndex; i < lines.length; i++) {
            const lowerLine = lines[i].toLowerCase();
            if (endKeywords.some(keyword => lowerLine.includes(keyword) && lowerLine.length < 50)) {
                educationEndIndex = i;
                break;
            }
        }

        const educationLines = lines.slice(educationStartIndex, Math.min(educationEndIndex, educationStartIndex + 10));
        extracted.education = educationLines.join('\n');
        console.log('Found education:', educationLines.length, 'lines');
    }

    // Extract salary expectations
    const salaryRegex = /(?:salary|expected|compensation|package)[\s:]*R?\s*(\d+[,\d]*)/i;
    const salaryMatch = text.match(salaryRegex);
    if (salaryMatch && salaryMatch[1]) {
        extracted.expectedSalary = 'R' + salaryMatch[1].replace(/,/g, '');
        console.log('Found salary:', extracted.expectedSalary);
    }

    // Extract previous employers (improved pattern matching)
    const companyPatterns = [
        /(?:at|@)\s+([A-Z][A-Za-z\s&]+(?:Ltd|Inc|Corp|Company|Pty)?)/g,
        /(?:Company|Employer):?\s+([A-Za-z\s&]+)/gi
    ];

    const companies = new Set();
    for (const pattern of companyPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null && companies.size < 3) {
            if (match[1] && match[1].trim().length > 2) {
                companies.add(match[1].trim());
            }
        }
    }

    extracted.previousEmployers = Array.from(companies).slice(0, 3).map(company => ({
        companyName: company,
        role: '',
        references: ''
    }));

    console.log('Extraction complete. Found:', {
        name: `${extracted.firstName} ${extracted.lastName}`,
        email: extracted.emailAddress,
        phone: extracted.contactNumber,
        city: extracted.city,
        jobTitle: extracted.jobTitle,
        industry: extracted.industry,
        hasSummary: !!extracted.professionalSummary,
        hasExperience: !!extracted.workExperience,
        hasSkills: !!extracted.skills,
        hasEducation: !!extracted.education
    });

    return extracted;
}

// POST /api/questionnaire/parse-cv
router.post('/parse-cv', upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No CV file uploaded' });
        }

        const filePath = req.file.path;
        const fileType = path.extname(req.file.originalname).toLowerCase();

        // Extract text from CV
        const text = await extractText(filePath, fileType);

        if (!text || text.length < 50) {
            // Delete the file
            await fs.unlink(filePath);
            return res.status(400).json({ message: 'Could not extract text from CV. Please check the file.' });
        }

        // Parse CV and extract fields
        const parsedData = parseCV(text);

        // Delete temporary file
        await fs.unlink(filePath);

        res.json({
            success: true,
            message: 'CV parsed successfully',
            data: parsedData
        });

    } catch (error) {
        console.error('===== CV PARSING ERROR =====');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('File info:', req.file ? {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        } : 'No file uploaded');
        console.error('============================');

        // Clean up file if it exists
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            message: 'Failed to parse CV',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;


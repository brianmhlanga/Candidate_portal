'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const questions = [
      {
        id: uuidv4(),
        question: 'Which number comes next in the sequence: 2, 4, 8, 16, ...?',
        options: JSON.stringify(['24', '32', '20', '28']),
        correctAnswer: '32',
        difficulty: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        question: 'If a clock reads 3:45, what is the angle between the hour and minute hands?',
        options: JSON.stringify(['90 degrees', '97.5 degrees', '82.5 degrees', '112.5 degrees']),
        correctAnswer: '97.5 degrees',
        difficulty: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        question: 'Complete the analogy: Bird is to wing as fish is to ...',
        options: JSON.stringify(['water', 'swim', 'fin', 'scale']),
        correctAnswer: 'fin',
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        question: 'If the day after tomorrow is two days before Wednesday, what day is today?',
        options: JSON.stringify(['Friday', 'Saturday', 'Sunday', 'Monday']),
        correctAnswer: 'Friday',
        difficulty: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        question: 'What is the next number in the sequence: 1, 4, 9, 16, 25, ...?',
        options: JSON.stringify(['30', '36', '42', '49']),
        correctAnswer: '36',
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        question: 'If all Zorks are Morks, and some Morks are Norks, then...',
        options: JSON.stringify([
          'All Zorks are Norks',
          'Some Zorks are Norks',
          'No Zorks are Norks',
          'Cannot be determined'
        ]),
        correctAnswer: 'Some Zorks are Norks',
        difficulty: 'hard',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        question: 'Which word does NOT belong with the others?',
        options: JSON.stringify(['Autumn', 'Spring', 'Winter', 'Tuesday']),
        correctAnswer: 'Tuesday',
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        question: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
        options: JSON.stringify(['5 minutes', '100 minutes', '20 minutes', '500 minutes']),
        correctAnswer: '5 minutes',
        difficulty: 'hard',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        question: 'Complete the sequence: O, T, T, F, F, S, S, ?',
        options: JSON.stringify(['E', 'T', 'N', 'H']),
        correctAnswer: 'E',
        difficulty: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        question: 'Which figure completes the pattern?',
        options: JSON.stringify(['Figure A', 'Figure B', 'Figure C', 'Figure D']),
        correctAnswer: 'Figure C',
        difficulty: 'hard',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Questions', questions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Questions', null, {});
  }
};

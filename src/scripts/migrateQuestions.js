import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/question.model.js';

dotenv.config(); // Load .env file

const migrateQuestions = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Connected to MongoDB");

        const oldDocId = '68c4da3212976c85219fbd7e'; // Replace with your actual ID
        const oldDoc = await Question.findById(oldDocId);

        if (!oldDoc) {
            console.log("Old document not found");
            process.exit(1);
        }

        const questions = oldDoc.questions;

        for (const q of questions) {
            const newQuestion = new Question({
                text: q.text,
                topic: q.topic,
                difficulty: q.difficulty,
                idealAnswer: q.idealAnswer,
                skillTags: q.skillTags,
                type: q.type,
                options: q.options,
                correctOptionIndex: q.correctOptionIndex
            });

            await newQuestion.save();
            console.log(`Migrated question: ${q.text}`);
        }

        console.log("All questions migrated successfully");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed", err);
        process.exit(1);
    }
};

migrateQuestions();

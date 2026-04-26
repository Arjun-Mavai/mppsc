import { relations } from "drizzle-orm/relations";
import { questions, attemptAnswers, userAttempts, tests, mppscUsers, topicRevisions, payments, pyqTopics, pyqQuestionTopics, pyqFactBank, pyqTopicTrends, freeQuizAttempts, pyqRepeatedCache, mppoliceOneLinerFacts, mppoliceOneLinerRevisions, guests, intelligenceFeedback } from "./schema";

export const attemptAnswersRelations = relations(attemptAnswers, ({one}) => ({
	question: one(questions, {
		fields: [attemptAnswers.questionId],
		references: [questions.id]
	}),
	userAttempt: one(userAttempts, {
		fields: [attemptAnswers.attemptId],
		references: [userAttempts.id]
	}),
}));

export const questionsRelations = relations(questions, ({one, many}) => ({
	attemptAnswers: many(attemptAnswers),
	test: one(tests, {
		fields: [questions.testId],
		references: [tests.id]
	}),
	pyqQuestionTopics: many(pyqQuestionTopics),
	pyqRepeatedCaches: many(pyqRepeatedCache),
}));

export const userAttemptsRelations = relations(userAttempts, ({one, many}) => ({
	attemptAnswers: many(attemptAnswers),
	test: one(tests, {
		fields: [userAttempts.testId],
		references: [tests.id]
	}),
	mppscUser: one(mppscUsers, {
		fields: [userAttempts.userId],
		references: [mppscUsers.id]
	}),
}));

export const testsRelations = relations(tests, ({many}) => ({
	questions: many(questions),
	userAttempts: many(userAttempts),
	freeQuizAttempts: many(freeQuizAttempts),
}));

export const mppscUsersRelations = relations(mppscUsers, ({many}) => ({
	userAttempts: many(userAttempts),
	topicRevisions: many(topicRevisions),
	payments: many(payments),
	mppoliceOneLinerRevisions: many(mppoliceOneLinerRevisions),
}));

export const topicRevisionsRelations = relations(topicRevisions, ({one}) => ({
	mppscUser: one(mppscUsers, {
		fields: [topicRevisions.userId],
		references: [mppscUsers.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	mppscUser: one(mppscUsers, {
		fields: [payments.userId],
		references: [mppscUsers.id]
	}),
}));

export const pyqQuestionTopicsRelations = relations(pyqQuestionTopics, ({one}) => ({
	pyqTopic: one(pyqTopics, {
		fields: [pyqQuestionTopics.topicId],
		references: [pyqTopics.id]
	}),
	question: one(questions, {
		fields: [pyqQuestionTopics.questionId],
		references: [questions.id]
	}),
}));

export const pyqTopicsRelations = relations(pyqTopics, ({many}) => ({
	pyqQuestionTopics: many(pyqQuestionTopics),
	pyqFactBanks: many(pyqFactBank),
	pyqTopicTrends: many(pyqTopicTrends),
}));

export const pyqFactBankRelations = relations(pyqFactBank, ({one}) => ({
	pyqTopic: one(pyqTopics, {
		fields: [pyqFactBank.topicId],
		references: [pyqTopics.id]
	}),
}));

export const pyqTopicTrendsRelations = relations(pyqTopicTrends, ({one}) => ({
	pyqTopic: one(pyqTopics, {
		fields: [pyqTopicTrends.topicId],
		references: [pyqTopics.id]
	}),
}));

export const freeQuizAttemptsRelations = relations(freeQuizAttempts, ({one}) => ({
	test: one(tests, {
		fields: [freeQuizAttempts.testId],
		references: [tests.id]
	}),
}));

export const pyqRepeatedCacheRelations = relations(pyqRepeatedCache, ({one}) => ({
	question: one(questions, {
		fields: [pyqRepeatedCache.questionId],
		references: [questions.id]
	}),
}));

export const mppoliceOneLinerRevisionsRelations = relations(mppoliceOneLinerRevisions, ({one}) => ({
	mppoliceOneLinerFact: one(mppoliceOneLinerFacts, {
		fields: [mppoliceOneLinerRevisions.factId],
		references: [mppoliceOneLinerFacts.id]
	}),
	mppscUser: one(mppscUsers, {
		fields: [mppoliceOneLinerRevisions.userId],
		references: [mppscUsers.id]
	}),
}));

export const mppoliceOneLinerFactsRelations = relations(mppoliceOneLinerFacts, ({many}) => ({
	mppoliceOneLinerRevisions: many(mppoliceOneLinerRevisions),
}));

export const intelligenceFeedbackRelations = relations(intelligenceFeedback, ({one}) => ({
	guest: one(guests, {
		fields: [intelligenceFeedback.guestId],
		references: [guests.id]
	}),
}));

export const guestsRelations = relations(guests, ({many}) => ({
	intelligenceFeedbacks: many(intelligenceFeedback),
}));
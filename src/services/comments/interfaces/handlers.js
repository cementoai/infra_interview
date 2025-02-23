const Consumer = require("../../../common/consumer");
const IssueUpsertedEvent = require("../../issues/sdk/events/issueUpserted");
const CommentsService = require("../domain/services/commentsService");

Consumer.register({
	topic: IssueUpsertedEvent.topic,
	handler: async event => {
		const commentsService = new CommentsService();
		await commentsService.create({
			parentId: event.issueId,
			description: `Issue ${event.issueId} was upserted by ${event.ownerId}`
		});
	}
});
  
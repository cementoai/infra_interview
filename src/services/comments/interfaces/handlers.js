const Consumer = require("../../../common/consumer");
const IssueCreatedEvent = require("../../issues/sdk/events/issueUpserted");
const CommentsService = require("../domain/services/commentsService");

Consumer.register({
	topic: IssueCreatedEvent.topic,
	handler: async event => {
		const commentsService = new CommentsService();
		await commentsService.create({
			parentId: event.issueId,
			description: `Issue ${event.issueId} was assigned to: ${event.assignToId}`,
		});
	}
});
  
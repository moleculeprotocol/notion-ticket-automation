export class NotionTicket {
    sprintTitle?: string;
    sprintId?: string;
    title?: string;
    description?: string;
    assignee?: string;
    createdAt?: Date;

    constructor(public author: string) {
        this.createdAt = new Date();
    }
    setSprintTitle(sprintTitle: string) {
        this.sprintTitle = sprintTitle;
    }
    setTitle(title: string) {
        this.title = title;
    }
    setDescription(description: string) {
        this.description = description;
    }
    setAssignee(assignee: string) {
        this.assignee = assignee;
    }
    setSprintId(sprintId: string) {
        this.sprintId = sprintId;
    }
}
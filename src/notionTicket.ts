export class NotionTicket {
    sprintName?: string;
    sprintId?: string;
    title?: string;
    owner?: string;
    description?: string;
    assignee?: string;
    createdAt?: Date;

    constructor(public author: string) {
        this.createdAt = new Date();
    }
    setSprintName(sprintMame: string) {
        this.sprintName = sprintMame;
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
    setOwner(owner: string) {
        this.owner = owner;
    }
}
export interface IDiscussion {
    _id: string;
    user: {
        _id: string;
        name: string;
        username: string;
        handle: string;
        avatar?: string;
    };
    room: string;
    content: string;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

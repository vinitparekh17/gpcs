type AssistantType = {
    id?: string | undefined;
    name: string;
    preConfig: string;
    type?: 'CUSTOM' | 'COMMUNITY';
    avatar: string | null;
    userId: string;
    createdAt?: Date;
};

interface IAssistant {
    name: string;
    preConfig: string;
    avatar: string | null;
    userId: string;
    insert(userId: string): Promise<AssistantType>;
}

type AssistantInput = {
    name: string;
    preConfig: string;
    avatar: string | null;
};

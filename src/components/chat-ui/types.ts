export enum MessageType {
    text = "text/plain",
    audio = "audio/pcm"
}

export interface Message {
    id: string,
    isUser: boolean,
    data: string,
    type: MessageType
}
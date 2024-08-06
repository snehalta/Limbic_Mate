export class MessageDataModel {
    text: string = "";
    sender: string = "";
    timeStamp: string = "";

    constructor(text: string, sender: string, timeStamp: string) {
        this.text = text;
        this.sender = sender;
        this.timeStamp = timeStamp;
    }

    static fromJson(json: any): MessageDataModel {
        const message = new MessageDataModel(
            json.text || "",
            json.sender || "",
            json.timeStamp || ""
        );
        return message;
    }
}
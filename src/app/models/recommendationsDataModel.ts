export class RecommendationsDataModel {
    title: string = "";
    description: string = "";
    youtubeUrl: string = "";

    constructor(text: string, sender: string, timeStamp: string) {
        this.title = text;
        this.description = sender;
        this.youtubeUrl = timeStamp;
    }

    static fromJson(json: any): RecommendationsDataModel {
        const recommendation = new RecommendationsDataModel(
            json.title || "",
            json.description || "",
            json.youtubeUrl || ""
        );
        return recommendation;
    }
}
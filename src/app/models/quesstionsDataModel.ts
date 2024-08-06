export class QuestionsDataModel {

    questionId: number = -1;
    questionText: string = "";
    questionAnswered: boolean = false;
    questionRecordedAnswer:number = 0;
    questionIndex:number = -1;

    constructor(
        questionId: number = -1,
        questionText: string = "",
        questionAnswered: boolean = false,
        questionRecordedAnswer: number = 0,
        questionIndex: number = -1
    ) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.questionAnswered = questionAnswered;
        this.questionRecordedAnswer = questionRecordedAnswer;
        this.questionIndex = questionIndex;
    }
}
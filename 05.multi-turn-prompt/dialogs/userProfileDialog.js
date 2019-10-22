// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { UserProfile } = require('../userProfile');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class UserProfileDialog extends ComponentDialog {
    constructor(userState) {
        super('userProfileDialog');

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            //Demographics: age and gender
            this.askAge.bind(this),
            this.ageStep.bind(this),
            this.confirmAgeStep.bind(this),

            this.askGender.bind(this),
            this.checkGender.bind(this),

            //preassessment
            this.explainPreAssessment.bind(this),
            this.preAssessment_1.bind(this),
            this.preAssessment_2.bind(this),
            this.preAssessment_3.bind(this),
            this.preAssessment_4.bind(this),
            this.preAssessment_5.bind(this)




            //this.summaryStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async askAge(step) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        return await step.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no']);
    }

    async ageStep(step) {
        if (step.result) {
            // User said "yes" so we will be prompting for the age.
            // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is a Prompt Dialog.
            const promptOptions = { prompt: 'Please enter your age.', retryPrompt: 'The value entered must be greater than 0 and less than 150.' };

            return await step.prompt(NUMBER_PROMPT, promptOptions);
        } else {
            // User said "no" so we will skip the next step. Give -1 as the age.
            return await step.next(-1);
        }
    }

    async confirmAgeStep(step) {
        step.values.age = step.result;

        if(step.values.age == -1){
            await step.context.sendActivity("You should provide your age to continue.");
            return step.endDialog();
        }
        else if(step.values.age < 18){
            await step.context.sendActivity("You are younger than 18!");
            return await step.endDialog();
        }
        
        const msg = `Thanks for providing your age!`;

        // We can send messages to the user at any point in the WaterfallStep.
        await step.context.sendActivity(msg);

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is a Prompt Dialog.
        return await step.next();
    }

    async askGender(step) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        // Running a prompt here means the next WaterfallStep will be run when the users response is received.
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please input your Gender.',
            choices: ChoiceFactory.toChoices(['Female', 'Male', 'Other'])
        });
    }

    async checkGender(step){
        if(step.result.value == "Other"){
            return await step.prompt(NAME_PROMPT, `Type in your gender`);
        }
        
        return await step.next(step.result.value);
    }

    async explainPreAssessment(step){
        step.values.gender = step.result.value;
        await step.context.sendActivity(`PREASSESSMENT EXPLAINED!.`);
        return await step.prompt(NAME_PROMPT, `Let's start?`);
    }

    async preAssessment_1(step){
        if(step.result){
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I consider myself to be an experienced technology user.',
                choices: ChoiceFactory.toChoices(['Strongly Disagree', 'Slightly Disagree', 'Neither Agree nor Disagree', 'Slightly Agree', 'Strongly Agree'])
            });
        }
        else {
            return await step.endDialog();
        }
    }

    async preAssessment_2(step){
        await step.context.sendActivity(step.result.value);
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I enjoy learning about new things using technology.',
                choices: ChoiceFactory.toChoices(['Strongly Disagree', 'Slightly Disagree', 'Neither Agree nor Disagree', 'Slightly Agree', 'Strongly Agree'])
            });
    }

    async preAssessment_3(step){
        await step.context.sendActivity(step.result.value);
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Music is important to me.',
                choices: ChoiceFactory.toChoices(['Strongly Disagree', 'Slightly Disagree', 'Neither Agree nor Disagree', 'Slightly Agree', 'Strongly Agree'])
            });    
    }

    async preAssessment_4(step){
        await step.context.sendActivity(step.result.value);
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I consider myself a fan of hip hop music.',
                choices: ChoiceFactory.toChoices(['Strongly Disagree', 'Slightly Disagree', 'Neither Agree nor Disagree', 'Slightly Agree', 'Strongly Agree'])
            });
    }

    async preAssessment_5(step){
        await step.context.sendActivity(step.result.value);
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I consider myself to be knowledgeable about hip hop history and/or culture.',
                choices: ChoiceFactory.toChoices(['Strongly Disagree', 'Slightly Disagree', 'Neither Agree nor Disagree', 'Slightly Agree', 'Strongly Agree'])
            });
    }



    async transportStep(step) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        // Running a prompt here means the next WaterfallStep will be run when the users response is received.
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter your mode of transport.',
            choices: ChoiceFactory.toChoices(['Car', 'Bus', 'Bicycle'])
        });
    }

    async nameStep(step) {
        step.values.transport = step.result.value;
        return await step.prompt(NAME_PROMPT, `What is your name, human?`);
    }

    async nameConfirmStep(step) {
        step.values.name = step.result;

        // We can send messages to the user at any point in the WaterfallStep.
        await step.context.sendActivity(`Thanks ${ step.result }.`);

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        return await step.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no']);
    }

    
    async summaryStep(step) {
        if (step.result) {
            // Get the current profile object from user state.
            const userProfile = await this.userProfile.get(step.context, new UserProfile());

            userProfile.transport = step.values.transport;
            userProfile.name = step.values.name;
            userProfile.age = step.values.age;
            userProfile.gender = step.values.gender;

            let msg = `I have your mode of transport as ${ userProfile.transport } and your name as ${ userProfile.name }.`;
            if (userProfile.age !== -1) {
                msg += ` And age as ${ userProfile.age }.`;
            }

            await step.context.sendActivity(msg);
        } else {
            await step.context.sendActivity('Thanks. Your profile will not be kept.');
        }

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
        return await step.endDialog();
    }

    async agePromptValidator(promptContext) {
        // This condition is our validation rule. You can also change the value at this point.
        return promptContext.recognized.succeeded && promptContext.recognized.value > 0 && promptContext.recognized.value < 150;
    }
}

module.exports.UserProfileDialog = UserProfileDialog;





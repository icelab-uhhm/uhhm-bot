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

var genre1_tally = 0;
var genre2_tally = 0;

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const BEGIN_PROMPT = 'BEGIN_PROMPT';
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
        this.addDialog(new TextPrompt(BEGIN_PROMPT, this.beginPromptValidator));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            //Demographics: age and gender
            this.startExperience.bind(this),
            // this.askAge.bind(this),
            // this.ageStep.bind(this),
            // this.confirmAgeStep.bind(this),

            // this.askGender.bind(this),
            // this.checkGender.bind(this),

            //Pre-Assessment
            this.explainPreAssessment.bind(this),
            this.preAssessment_1.bind(this),
            this.preAssessment_2.bind(this),
            this.preAssessment_3.bind(this),
            this.preAssessment_4.bind(this),
            this.preAssessment_5.bind(this),

            //Music Survey
            this.explainMusicSurvey.bind(this),
            this.musicSurvey_1.bind(this),
            this.musicSurvey_2.bind(this),
            this.musicSurvey_3.bind(this),
            this.musicSurvey_4.bind(this),
            this.musicSurvey_5.bind(this),
            this.musicSurvey_6.bind(this),
            this.musicSurvey_7.bind(this),
            this.musicSurvey_8.bind(this),

            //Lyric Survey
            this.explainLyricSurvey.bind(this)

            //Narrative Experience

            //Consent

            //Post-Assessment

            //Conclusion

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


    async startExperience(step){
        const promptOptions = { prompt: 'Type "yes" when you are ready to get started.', retryPrompt: 'Type "yes" when you are ready to get started.' };

        return await step.prompt(BEGIN_PROMPT, promptOptions);
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
       await step.context.sendActivity("Please indicate how you agree or disagree with each of the following statements:");
       return step.next();
    }

    async preAssessment_1(step){
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I consider myself to be an experienced technology user.',
                choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
            });
    }

    async preAssessment_2(step) {
        step.values.preAssessment_1 = step.result.value;
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I enjoy learning about new things using technology.',
                choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
            });
    }

    async preAssessment_3(step) {
        step.values.preAssessment_2 = step.result.value;
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Music is important to me.',
                choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
            });   
    }

    async preAssessment_4(step) {
        step.values.preAssessment_3 = step.result.value;
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'I consider myself a fan of hip hop music.',
            choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
        }); 
            
    }

    async preAssessment_5(step) {
        step.values.preAssessment_4 = step.result.value;
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'I consider myself to be knowledgeable about hip hop history and/or culture.',
            choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
        }); 
        
    }

    async explainMusicSurvey(step) {
        step.values.preAssessment_5 = step.result.value;
        await step.context.sendActivity("Excellent. Now, let’s get to the fun stuff. As a hip hop elemental, I have the power to tell a story specifically for you. I want you to tell me more about your music preferences. I will use this information to  customize your narrative experience.");
       
        const promptOptions = { prompt: 'Type "yes" when you are ready to get started.', retryPrompt: 'Type "yes" when you are ready to get started.' };
        return await step.prompt(BEGIN_PROMPT, promptOptions);  
    }

    async musicSurvey_1(step){
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Between these two genres of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["Classical", "Pop"])
        }); 
    }

    async musicSurvey_2(step) {
        step.values.musicSurvey_1 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${ step.result.value }.`);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "classical") { genre1_tally++; }
        else if (lastChosenGenre == "pop") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Between these two genres of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["Jazz", "Country"])
        }); 
    }

    async musicSurvey_3(step) {
        step.values.musicSurvey_2 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "jazz") { genre1_tally++; }
        else if (lastChosenGenre == "country") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Between these two genres of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["World Music", "Heavy Metal"])
        });
    }

    async musicSurvey_4(step) {
        step.values.musicSurvey_3 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "world music") { genre1_tally++; }
        else if (lastChosenGenre == "heavy metal") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Between these two genres of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["Classical", "Electronica"])
        });
    }

    async musicSurvey_5(step) {
        step.values.musicSurvey_4 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "classical") { genre1_tally++; }
        else if (lastChosenGenre == "electronica") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Between these two genres of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["Jazz", "Rap"])
        });
    }

    async musicSurvey_6(step) {
        step.values.musicSurvey_5 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "jazz") { genre1_tally++; }
        else if (lastChosenGenre == "rap") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Between these two genres of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["World Music", "Electronica"])
        });
    }

    async musicSurvey_7(step) {
        step.values.musicSurvey_6 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "world music") { genre1_tally++; }
        else if (lastChosenGenre == "electronica") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Between these two genres of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["Classical", "Rap"])
        });
    }

    async musicSurvey_8(step) {
        step.values.musicSurvey_7 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "classical") { genre1_tally++; }
        else if (lastChosenGenre == "rap") { genre2_tally++; }

        var musicCategory = "";
        if (genre1_tally > genre2_tally) { musicCategory = "sophisticated"; }
        else { musicCategory = "unsophisticated"; }

        //return await step.context.sendActivity("Your music category is: " + musicCategory);

        const userProfile = await this.userProfile.get(step.context, new UserProfile());

        //userProfile.age = step.values.age;
        //userProfile.gender = step.values.gender;
        userProfile.preAssessment = [step.values.preAssessment_1, step.values.preAssessment_2, step.values.preAssessment_3, step.values.preAssessment_4, step.values.preAssessment_5];
        userProfile.musicSurveyChoices = [step.values.musicSurvey_1, step.values.musicSurvey_2, step.values.musicSurvey_3, step.values.musicSurvey_4, step.values.musicSurvey_5];
        userProfile.musicCategory = musicCategory;

        console.log(`Here are your pre - assessment choices: ${ userProfile.preAssessment }`);
        console.log(`Here are your music survey choices: ${userProfile.musicSurveyChoices}`);
        console.log(`Here is your music category: ${userProfile.musicCategory}`);

        if (musicCategory == "sophisticated") {
            await step.context.sendActivity(`Ah, so you like that ${userProfile.musicCategory} kind of sound. How interesting!`);
            return await step.next(-2);
        }
        else {
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                choices: ChoiceFactory.toChoices(["Rap", "Early Rock N Roll"])
            });
        }
    }

    async musicSurvey_9(step) {
        step.values.musicSurvey_8 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "classical") { genre1_tally++; }
        else if (lastChosenGenre == "rap") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Between these two genres of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["Rock", "Country"])
        });

    }

    async explainLyricSurvey(step) {
        await step.context.sendActivity("Now I am curious to learn about your taste in hip hop lyrics. Let me ask you a few more questions.");
        return step.next();
    }

    //async transportStep(step) {
    //    // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
    //    // Running a prompt here means the next WaterfallStep will be run when the users response is received.
    //    return await step.prompt(CHOICE_PROMPT, {
    //        prompt: 'Please enter your mode of transport.',
    //        choices: ChoiceFactory.toChoices(['Car', 'Bus', 'Bicycle'])
    //    });
    //}

    //async nameStep(step) {
    //    step.values.transport = step.result.value;
    //    return await step.prompt(NAME_PROMPT, `What is your name, human?`);
    //}

    //async nameConfirmStep(step) {
    //    step.values.name = step.result;

    //    // We can send messages to the user at any point in the WaterfallStep.
    //    await step.context.sendActivity(`Thanks ${ step.result }.`);

    //    // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
    //    return await step.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no']);
    //}

    
    //async summaryStep(step) {
    //    if (step.result) {
    //        // Get the current profile object from user state.
    //        const userProfile = await this.userProfile.get(step.context, new UserProfile());

    //        userProfile.transport = step.values.transport;
    //        userProfile.name = step.values.name;
    //        userProfile.age = step.values.age;
    //        userProfile.gender = step.values.gender;

    //        let msg = `I have your mode of transport as ${ userProfile.transport } and your name as ${ userProfile.name }.`;
    //        if (userProfile.age !== -1) {
    //            msg += ` And age as ${ userProfile.age }.`;
    //        }

    //        await step.context.sendActivity(msg);
    //    } else {
    //        await step.context.sendActivity('Thanks. Your profile will not be kept.');
    //    }

    //    // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
    //    return await step.endDialog();
    //}

    async agePromptValidator(promptContext) {
        // This condition is our validation rule. You can also change the value at this point.
        return promptContext.recognized.succeeded && promptContext.recognized.value > 0 && promptContext.recognized.value < 150;
    }

    async beginPromptValidator(promptContext) {
        // This condition is our validation rule. You can also change the value at this point.
        var str = new String(promptContext.recognized.value.toLowerCase());
        //console.log(str);
        return str.valueOf() === "yes".valueOf();
    }
}

module.exports.UserProfileDialog = UserProfileDialog;





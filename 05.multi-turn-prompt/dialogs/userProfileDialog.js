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
var userProfile;

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
            //this.preAssessment_1.bind(this),
            //this.preAssessment_2.bind(this),
            //this.preAssessment_3.bind(this),
            //this.preAssessment_4.bind(this),
            //this.preAssessment_5.bind(this),

            //Music Survey
            //this.explainMusicSurvey.bind(this),
            this.musicSurvey_st1_1.bind(this),
            this.musicSurvey_st1_2.bind(this),
            this.musicSurvey_st1_3.bind(this),
            this.musicSurvey_st1_4.bind(this),
            this.musicSurvey_st1_5.bind(this),
            this.musicSurvey_st1_6.bind(this),
            this.musicSurvey_st1_7.bind(this),
            this.musicSurvey_st2_1.bind(this),
            this.musicSurvey_st2_2.bind(this),
            this.musicSurvey_st2_3.bind(this),
            this.musicSurvey_st2_4.bind(this),
            this.musicSurvey_st2_5.bind(this),
            this.musicSurvey_st3_or_4_1.bind(this),
            this.musicSurvey_st3_or_4_2.bind(this),
            this.musicSurvey_st3_or_4_3.bind(this),
            this.musicSurvey_final.bind(this),

            //Lyric Survey
            this.explainLyricSurvey.bind(this)
            // this.lyricSurvey_1.bind(this),
            // this.lyricSurvey_2.bind(this),
            // this.lyricSurvey_3.bind(this),
            // this.lyricSurvey_4.bind(this),
            // this.lyricSurvey_5.bind(this),
            // this.lyricSurvey_final.bind(this),

            // TODO: NARRATIVE FLOW
            // this.explainNarrativeCustomization.bind(this),
            // this.introduceNarrative.bind(this),
            // this.beginNarrative.bind(this),

            // TODO: CONSENT FLOW
            // this.checkIfAdult.bind(this),
            // this.askConsent.bind(this),
            // this.checkConsent.bind(this),

            // TODO: POST-ASSESSMENT FLOW
            // this.askAge.bind(this),
            // this.askGender.bind(this),
            // this.checkGender.bind(this),
            // this.preAssessment_1.bind(this),
            // this.preAssessment_2.bind(this),
            // this.preAssessment_3.bind(this),
            // this.preAssessment_4.bind(this),
            // this.preAssessment_5.bind(this),
            // this.preAssessment_6.bind(this),
            // this.checkRating.bind(this),

            // TODO: CONCLUSION
            // this.endExperience_1.bind(this),
            // this.endExperience_2.bind(this),
            // this.endExperience_3.bind(this),

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

    async musicSurvey_st1_1(step){
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Between these two genres of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["Classical", "Pop"])
        }); 
    }

    async musicSurvey_st1_2(step) {
        step.values.musicSurvey_st1_1 = step.result.value;
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

    async musicSurvey_st1_3(step) {
        step.values.musicSurvey_st1_2 = step.result.value;
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

    async musicSurvey_st1_4(step) {
        step.values.musicSurvey_st1_3 = step.result.value;
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

    async musicSurvey_st1_5(step) {
        step.values.musicSurvey_st1_4 = step.result.value;
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

    async musicSurvey_st1_6(step) {
        step.values.musicSurvey_st1_5 = step.result.value;
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

    async musicSurvey_st1_7(step) {
        step.values.musicSurvey_st1_6 = step.result.value;
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

    async musicSurvey_st2_1(step) {
        step.values.musicSurvey_st1_7 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "classical") { genre1_tally++; }
        else if (lastChosenGenre == "rap") { genre2_tally++; }

        var musicCategory = "";
        if (genre1_tally > genre2_tally) { musicCategory = "sophisticated"; }
        else { musicCategory = "unsophisticated"; }

        //return await step.context.sendActivity("Your music category is: " + musicCategory);

        userProfile = await this.userProfile.get(step.context, new UserProfile());
        userProfile.preAssessment = [step.values.preAssessment_1, step.values.preAssessment_2, step.values.preAssessment_3, step.values.preAssessment_4, step.values.preAssessment_5];
        userProfile.musicSurveyChoices = [step.values.musicSurvey_st1_1, step.values.musicSurvey_st1_2, step.values.musicSurvey_st1_3, step.values.musicSurvey_st1_4, step.values.musicSurvey_st1_5, step.values.musicSurvey_st1_6, step.values.musicSurvey_st1_7];

        if (musicCategory == "sophisticated") {
            userProfile.musicCategory = musicCategory;
            await step.context.sendActivity(`Ah, so you like that ${userProfile.musicCategory} kind of sound. How interesting!`);
            return await step.next();
        }
        else {
            // reset genre 1 and 2 tallies to zero
            genre1_tally = 0;
            genre2_tally = 0;

            //proceed to part 2 of 4 in music survey
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                choices: ChoiceFactory.toChoices(["Rap", "Early Rock N Roll"])
            });
        }
    }

    async musicSurvey_st2_2(step) {
        if (userProfile.musicCategory == "") {
            step.values.musicSurvey_st2_1 = step.result.value;
            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);

            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "rap") { genre1_tally++; }
            else if (lastChosenGenre == "early rock n roll") { genre2_tally++; }

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                choices: ChoiceFactory.toChoices(["Rock", "Country"])
            });
        }
        else {
            return await step.next();
        }

    }

    async musicSurvey_st2_3(step) {
        if (userProfile.musicCategory == "") {
            step.values.musicSurvey_st2_2 = step.result.value;
            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);

            // Update the tallies for genre 1 and genre 2 
            if (lastChosenGenre == "rock") { genre1_tally++; }
            else if (lastChosenGenre == "country") { genre2_tally++; }

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                choices: ChoiceFactory.toChoices(["Heavy Metal", "Soft Rock"])
            });
        }
        else {
            return await step.next();
        }

    }

    async musicSurvey_st2_4(step) {
        if (userProfile.musicCategory == "") {
            step.values.musicSurvey_st2_3 = step.result.value;
            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);

            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "heavy metal") { genre1_tally++; }
            else if (lastChosenGenre == "soft rock") { genre2_tally++; }

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                choices: ChoiceFactory.toChoices(["Punk", "Pop"])
            });
        }
        else {
            return await step.next();
        }

    }

    async musicSurvey_st2_5(step) {
        if (userProfile.musicCategory == "") {
            step.values.musicSurvey_st2_4 = step.result.value;
            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);

            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "punk") { genre1_tally++; }
            else if (lastChosenGenre == "pop") { genre2_tally++; }

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                choices: ChoiceFactory.toChoices(["Electronica", "Soul/R&B"])
            });
        }
        else {
            return await step.next();
        }
    }

    async musicSurvey_st3_or_4_1(step) {
        if (userProfile.musicCategory == "") {
            step.values.musicSurvey_st2_5 = step.result.value;
            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);

            userProfile.musicSurveyChoices.push(step.values.musicSurvey_st2_1, step.values.musicSurvey_st2_2, step.values.musicSurvey_st2_3, step.values.musicSurvey_st2_4, step.values.musicSurvey_st2_5);

            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "electronica") { genre1_tally++; }
            else if (lastChosenGenre == "soul/r&b") { genre2_tally++; }
            console.log("musicSurvey_st3_or_4_1");
            if (genre1_tally > genre2_tally) {
                // user proceeds to musicSurvey_st3_1 (intense or urban categories)
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                    choices: ChoiceFactory.toChoices(["Heavy Metal", "Acid Jazz"])
                });
            }
            else {
                // user proceeds to musicSurvey_st4_1 (campestral or mellow categories)
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                    choices: ChoiceFactory.toChoices(["Country", "Pop"])
                });
            }
        }
        else {
            return await step.next();
        }

    }

    async musicSurvey_st3_or_4_2(step) {
        if (userProfile.musicCategory == "") {
            step.values.musicSurvey_st3_or_4_1 = step.result.value;

            genre1_tally = 0;
            genre2_tally = 0;

            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);
            console.log("musicSurvey_st3_or_4_2");
            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "heavy metal" || "acid jazz") {
                // user is in step 3_1
                if (lastChosenGenre == "heavy metal") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                    choices: ChoiceFactory.toChoices(["Punk", "Rap"])
                });
            }
            else if (lastChosenGenre == "country" || "pop") {
                // user is in step 4_1
                if (lastChosenGenre == "country") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                    choices: ChoiceFactory.toChoices(["Soft Rock", "Jazz"])
                });
            }
        }
        else {
            return await step.next();
        }
    }

    async musicSurvey_st3_or_4_3(step) {
        if (userProfile.musicCategory == "") {
            step.values.musicSurvey_st3_or_4_2 = step.result.value;
            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);
            console.log("musicSurvey_st3_or_4_3");
            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "punk" || "rap") {
                // user is in step 3_2
                if (lastChosenGenre == "punk") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                    choices: ChoiceFactory.toChoices(["Rock", "Funk"])
                });
            }
            else if (lastChosenGenre == "soft rock" || "jazz") {
                // user is in step 4_1
                if (lastChosenGenre == "soft rock") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Between these two genres of music, which would you prefer to listen to more?',
                    choices: ChoiceFactory.toChoices(["Early Rock N Roll", "Soul/R&B"])
                });
            }
        }
        else {
            return await step.next();
        }
    }

    async musicSurvey_final(step) {
        if (userProfile.musicCategory == "") {
            console.log("musicSurvey_final");
            step.values.musicSurvey_st3_or_4_3 = step.result.value;
            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);

            userProfile.musicSurveyChoices.push(step.values.musicSurvey_st3_or_4_1, step.values.musicSurvey_st3_or_4_2, step.values.musicSurvey_st3_or_4_3);

            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "rock" || "funk") {
                // user is in step 3_3
                if (lastChosenGenre == "rock") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }

                if (genre1_tally > genre2_tally) {
                    // music category is intense
                    userProfile.musicCategory = "intense";
                    await step.context.sendActivity(`Ah, so you like that ${userProfile.musicCategory} kind of sound. How interesting!`);
                    return await step.next();
                }
                else {
                    // music category is urban
                    userProfile.musicCategory = "urban";
                    await step.context.sendActivity(`Ah, so you like that ${userProfile.musicCategory} kind of sound. How interesting!`);
                    return await step.next();
                }
            }
            else if (lastChosenGenre == "early rock n roll" || "soul/r&b") {
                // user is in step 4_1
                if (lastChosenGenre == "early rock n roll") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }

                if (genre1_tally > genre2_tally) {
                    // music category is campestral
                    userProfile.musicCategory = "campestral";
                    await step.context.sendActivity(`Ah, so you like that ${userProfile.musicCategory} kind of sound. How interesting!`);
                    return await step.next();
                }
                else {
                    // music category is mellow
                    userProfile.musicCategory = "mellow";
                    await step.context.sendActivity(`Ah, so you like that ${userProfile.musicCategory} kind of sound. How interesting!`);
                    return await step.next();
                }
            }
        }
        else {
            return await step.next();
        }
    }

    async explainLyricSurvey(step) {
        await step.context.sendActivity("Now I am curious to learn about your taste in hip hop lyrics. Let me ask you a few more questions.");
        return step.next();
    }

    // TODO: LYRIC SURVEY
    // Question 1 of 5
    // Question 2 of 5
    // Question 3 of 5
    // Question 4 of 5
    // Question 5 of 5
    // Feedback on user's lyrical taste

    // TODO: NARRATIVE FLOW
    // Explain customization
    // Invites user to enter begin
    // Introduce narrative + tell user to enter next when they are done

    // TODO: CONSENT FLOW
    // Ask user if they are 18 and older
    // If they are 18+, prompt for consent; else, skip to transition page
    // If 18+ user says yes, continue to post assessment flow; else, skip to transition page

    // TODO: POST-ASSESSMENT FLOW
    // Age bracket
    // Gender
    // Question 1 of 6
    // Question 2 of 6
    // Question 3 of 6
    // Question 4 of 6
    // Question 5 of 6
    // Question 6 of 6
    // Statement about user's rating


    // TODO: CONCLUSION
    // Thank user for participating
    // Invite them to scan their QR code
    // Tell them to enter "done" when they are finished


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





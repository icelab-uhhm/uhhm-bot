// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');

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
var userIsAdult = false;
var L1 = "";
var L2 = "";
var lyric_category_tally = {FL:0, SIL:0, LL:0};
var lyric_category_map = { FL: "Fashion", SIL: "Social Issues", LL: "Location" };

// TODO: Fox to update the adjectives associated with giving user feedback on their music survey outcome
var music_category_user_map = { "sophisticated": "artsy", "intense": "intense", "urban": "danceable", "mellow": "mellow", "campestral": "rootsy" };

// TODO: Fox to update the adjectives associated with giving user feedback on their lyric survey outcome
var lyric_category_user_map = { "Fashion": "fashion", "Social Issues": "social impacts", "Location": "location" };

// TODO: Fox to update transition text to suit tone and personality of characters. Right now, these transitions are chosen at random between questions.
var transitions = { 0: "Dope! Let’s move to the next question.", 1: "Word! Let's move on." };

var lyric, url, songName, singerName;

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
            // Introduction
            this.startExperience1.bind(this),
            this.startExperience2.bind(this),

            //Pre-Assessment
            this.explainPreAssessment.bind(this),
            this.preAssessment_1.bind(this),
            this.preAssessment_2.bind(this),
            this.preAssessment_3.bind(this),

            ////Music Survey
            this.explainMusicSurvey.bind(this),
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
            this.explainLyricSurvey.bind(this),
            this.lyricSurvey_1.bind(this),
            this.lyricSurvey_2.bind(this),
            this.lyricSurvey_3.bind(this),
            this.lyricSurvey_4.bind(this),
            this.lyricSurvey_5.bind(this),
            this.lyricSurvey_final.bind(this),

            // NARRATIVE FLOW
             this.explainNarrativeCustomization.bind(this),
             this.introduceNarrative.bind(this),
             this.beginNarrative.bind(this),
             this.concludeNarrative.bind(this),

            // CONSENT FLOW
             this.checkIfAdult.bind(this),
             this.askConsent.bind(this),
             this.checkConsent.bind(this),

            // POST-ASSESSMENT FLOW
             this.askAge.bind(this),
             this.askGender.bind(this),
             this.checkGender.bind(this),
             this.explainPostAssessment.bind(this),
             this.postAssessment_0_1.bind(this),
             this.postAssessment_0_2.bind(this),
             this.postAssessment_1.bind(this),
             this.postAssessment_2.bind(this),
             this.postAssessment_3.bind(this),
             this.postAssessment_4.bind(this),
             this.postAssessment_5.bind(this),
             this.postAssessment_6.bind(this),
             this.checkRating.bind(this),

            // CONCLUSION
             this.endExperience_1.bind(this),
             this.endExperience_2.bind(this),
             this.endExperience_3.bind(this),

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


    async startExperience1(step){
        const promptOptions = { prompt: 'Type "yes" to continue.', retryPrompt: 'Type "yes" to continue.' };
        return await step.prompt(BEGIN_PROMPT, promptOptions);
    }

    async startExperience2(step) {
        await step.context.sendActivity("As Hip Hop Elementals, we have the power to tell a story specifically for you.");
        await step.context.sendActivity("To kick it off, we got some questions about your feelings towards Hip Hop and music in general.");

        const promptOptions = { prompt: 'Type "yes" when you are ready to get started.', retryPrompt: 'Type "yes" when you are ready to get started.' };
        return await step.prompt(BEGIN_PROMPT, promptOptions);
    }

    
   
    //async askAge(step) {
    //    // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
    //    return await step.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no']);
    //}

    async explainPreAssessment(step) {

        // TODO: Replace Elemental Image
        var img = "https://uhhmstorage.blob.core.windows.net/artwork/Graffiti.png";
        var text = "Graffiti here. Let's kick this thing off!";
        await step.context.sendActivity({ attachments: [this.createHeroCard(img, text)] });

        await step.context.sendActivity("**I want you to tell me how you agree or disagree with each of the following statements:**");

        return step.next();
    }

    async preAssessment_1(step){
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I consider myself a fan of Hip Hop music.',
                choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
            });
    }

    async preAssessment_2(step) {
        step.values.preAssessment_1 = step.result.value;

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Music is important to me.',
                choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
            });
    }

    async preAssessment_3(step) {
        step.values.preAssessment_2 = step.result.value;
        
        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: "I'm knowledgeable about Hip Hop history and/or culture.",
                choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
            });   
    }

    //async preAssessment_4(step) {
    //    step.values.preAssessment_3 = step.result.value;

    //    var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
    //    await step.context.sendActivity(transitions[rndInd]);

    //    return await step.prompt(CHOICE_PROMPT, {
    //        prompt: "I'm an experienced technology user.",
    //        choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
    //    }); 
            
    //}

    //async preAssessment_5(step) {
    //    step.values.preAssessment_4 = step.result.value;

    //    var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
    //    await step.context.sendActivity(transitions[rndInd]);

    //    return await step.prompt(CHOICE_PROMPT, {
    //        prompt: 'I enjoy learning about new things using technology.',
    //        choices: ChoiceFactory.toChoices(['Disagree',  'Neutral', 'Agree'])
    //    }); 
        
    //}

    async explainMusicSurvey(step) {
        step.values.preAssessment_5 = step.result.value;

        // TODO: Replace Elemental Image
        var img = "https://uhhmstorage.blob.core.windows.net/artwork/DJ.png";
        var text = "Yo, it's DJ. Let's get to the fun stuff!";
        await step.context.sendActivity({ attachments: [this.createHeroCard(img, text)] });

        await step.context.sendActivity("**We need you to tell us more about your music tastes. We’ll use this information to customize the story you’ll experience.**");
       
        const promptOptions = { prompt: 'Type "yes" when you are ready to get started.', retryPrompt: 'Type "yes" when you are ready to get started.' };
        return await step.prompt(BEGIN_PROMPT, promptOptions);  
    }

    async musicSurvey_st1_1(step){
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Yo, between these two types of music, which would you prefer to listen to more?',
            choices: ChoiceFactory.toChoices(["Classical", "Pop"])
        }); 
    }

    async musicSurvey_st1_2(step) {
        step.values.musicSurvey_st1_1 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${ step.result.value }.`);

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        //await step.context.sendActivity(transitions[rndInd]);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "classical") { genre1_tally++; }
        else if (lastChosenGenre == "pop") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Aight, between these two types of music, which is more dope?',
            choices: ChoiceFactory.toChoices(["Jazz", "Country"])
        }); 
    }

    async musicSurvey_st1_3(step) {
        step.values.musicSurvey_st1_2 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        //await step.context.sendActivity(transitions[rndInd]);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "jazz") { genre1_tally++; }
        else if (lastChosenGenre == "country") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Cool, between these two types of music, which do you like more?',
            choices: ChoiceFactory.toChoices(["World Music", "Heavy Metal"])
        });
    }

    async musicSurvey_st1_4(step) {
        step.values.musicSurvey_st1_3 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        //await step.context.sendActivity(transitions[rndInd]);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "world music") { genre1_tally++; }
        else if (lastChosenGenre == "heavy metal") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Nice. Between these next two types of music, which do ya like better?',
            choices: ChoiceFactory.toChoices(["Classical", "Electronica"])
        });
    }

    async musicSurvey_st1_5(step) {
        step.values.musicSurvey_st1_4 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        //await step.context.sendActivity(transitions[rndInd]);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "classical") { genre1_tally++; }
        else if (lastChosenGenre == "electronica") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Word up. Now, between these two kinds of music, which do you like better?',
            choices: ChoiceFactory.toChoices(["Jazz", "Rap"])
        });
    }

    async musicSurvey_st1_6(step) {
        step.values.musicSurvey_st1_5 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        //await step.context.sendActivity(transitions[rndInd]);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "jazz") { genre1_tally++; }
        else if (lastChosenGenre == "rap") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Aight, between these two types of music, which is more dope?',
            choices: ChoiceFactory.toChoices(["World Music", "Electronica"])
        });
    }

    async musicSurvey_st1_7(step) {
        step.values.musicSurvey_st1_6 = step.result.value;
        var lastChosenGenre = step.result.value.toLowerCase();
        //await step.context.sendActivity(`You chose: ${step.result.value}.`);

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        //await step.context.sendActivity(transitions[rndInd]);

        // Update the tallies for genre 1 and genre 2
        if (lastChosenGenre == "world music") { genre1_tally++; }
        else if (lastChosenGenre == "electronica") { genre2_tally++; }

        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'I gotchu! Between these two types of music, which would you prefer to listen to more?',
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
        //userProfile.preAssessment = [step.values.preAssessment_1, step.values.preAssessment_2, step.values.preAssessment_3, step.values.preAssessment_4, step.values.preAssessment_5];
        userProfile.preAssessment = [step.values.preAssessment_1, step.values.preAssessment_2, step.values.preAssessment_3];
        userProfile.musicSurveyChoices = [step.values.musicSurvey_st1_1, step.values.musicSurvey_st1_2, step.values.musicSurvey_st1_3, step.values.musicSurvey_st1_4, step.values.musicSurvey_st1_5, step.values.musicSurvey_st1_6, step.values.musicSurvey_st1_7];

        if (musicCategory == "sophisticated") {
            userProfile.musicCategory = musicCategory;
            await step.context.sendActivity(`Ah, so you like that ${music_category_user_map[userProfile.musicCategory]} kind of sound. How interesting!`);
            const promptOptions = { prompt: 'Type "yes" when you are ready to continue.', retryPrompt: 'Type "yes" when you are ready to continue.' };
            return await step.prompt(BEGIN_PROMPT, promptOptions);
        }
        else {
            // reset genre 1 and 2 tallies to zero
            genre1_tally = 0;
            genre2_tally = 0;

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            //await step.context.sendActivity(transitions[rndInd]);

            //proceed to part 2 of 4 in music survey
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Cool, cool. Now, between these two types of music, which one do you like more?',
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
            
            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            //await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Right on. Aight, between these two kinds of music, which is better to you?',
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

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            //await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Tight. Ok, between these two types of music, which ya like more?',
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

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            //await step.context.sendActivity(transitions[rndInd]);
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Dope! Between these two types of music, which do you like more?',
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

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            //await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Got it. Now, which of these kinds of music ya like more?',
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

            //console.log("Music Survey Step 3 or 4:");
            //console.log("Genre 1 Tally: " + genre1_tally);
            //console.log("Genre 2 Tally: " + genre2_tally);

            if (genre1_tally > genre2_tally) {
                //console.log("STEP 3 (Genre 1 > Genre 2)");
                genre1_tally = 0;
                genre2_tally = 0;

                var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
                //await step.context.sendActivity(transitions[rndInd]);

                // user proceeds to musicSurvey_st3_1 (intense or urban categories)
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'I feel you. Between these two genres of music, which one do you like more?',
                    choices: ChoiceFactory.toChoices(["Heavy Metal", "Acid Jazz"])
                });
            }
            else {
                //console.log("STEP 4 (Genre 1 < Genre 2)");
                genre1_tally = 0;
                genre2_tally = 0;
                // user proceeds to musicSurvey_st4_1 (campestral or mellow categories)

                var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
                //await step.context.sendActivity(transitions[rndInd]);

                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Gotchu. Between these two genres of music, which do ya prefer more?',
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

            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);
            //console.log("musicSurvey_st3_or_4_2 -- last Chosen Genre is: ");
            //console.log(lastChosenGenre);

            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "heavy metal" || lastChosenGenre == "acid jazz") {
                // user is in step 3_1
                //console.log("STEP 3 - Question #1");

                if (lastChosenGenre == "heavy metal") {
                    genre1_tally++;
                    //console.log("Genre 1 Tally: " + genre1_tally);
                    //console.log("Genre 2 Tally: " + genre2_tally);
                }
                else {
                    genre2_tally++;
                    //console.log("Genre 1 Tally: " + genre1_tally);
                    //console.log("Genre 2 Tally: " + genre2_tally);
                }

                var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
                //await step.context.sendActivity(transitions[rndInd]);

                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Cool, cool. Between these two types of music, which would ya wanna listen to more?',
                    choices: ChoiceFactory.toChoices(["Punk", "Rap"])
                });
            }
            else if (lastChosenGenre == "country" || lastChosenGenre == "pop") {
                // user is in step 4_1
                //console.log("STEP 4 - Question #1");

                if (lastChosenGenre == "country") {
                    genre1_tally++;
                    //console.log("Genre 1 Tally: " + genre1_tally);
                    //console.log("Genre 2 Tally: " + genre2_tally);
                }
                else {
                    genre2_tally++;
                    //console.log("Genre 1 Tally: " + genre1_tally);
                    //console.log("Genre 2 Tally: " + genre2_tally);
                }

                var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
                //await step.context.sendActivity(transitions[rndInd]);

                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Aight. Between these two types of music, which would you prefer more?',
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
            //console.log("musicSurvey_st3_or_4_3");
            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "punk" || lastChosenGenre == "rap") {
                // user is in step 3_2
                //console.log("STEP 3 - Question #2");

                if (lastChosenGenre == "punk") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }

                var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
                //await step.context.sendActivity(transitions[rndInd]);

                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Word! Between these two types of music, which is better to you?',
                    choices: ChoiceFactory.toChoices(["Rock", "Funk"])
                });
            }
            else if (lastChosenGenre == "soft rock" || lastChosenGenre == "jazz") {
                // user is in step 4_2
                //console.log("STEP 4 - Question #2");

                if (lastChosenGenre == "soft rock") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }

                var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
                //await step.context.sendActivity(transitions[rndInd]);

                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Bet. Between these two types of music, which do you prefer more?',
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
            //console.log("musicSurvey_final");
            step.values.musicSurvey_st3_or_4_3 = step.result.value;
            var lastChosenGenre = step.result.value.toLowerCase();
            //await step.context.sendActivity(`You chose: ${step.result.value}.`);

            userProfile.musicSurveyChoices.push(step.values.musicSurvey_st3_or_4_1, step.values.musicSurvey_st3_or_4_2, step.values.musicSurvey_st3_or_4_3);

            // Update the tallies for genre 1 and genre 2
            if (lastChosenGenre == "rock" || lastChosenGenre == "funk") {
                // user is in step 3_3
                //console.log("STEP 3 - Question #3");

                if (lastChosenGenre == "rock") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }

                if (genre1_tally > genre2_tally) {
                    // music category is intense
                    userProfile.musicCategory = "intense";
                    await step.context.sendActivity(`Ah, so you like that ${music_category_user_map[userProfile.musicCategory]} kind of sound. How interesting!`);
                    const promptOptions = { prompt: 'Type "yes" when you are ready to continue.', retryPrompt: 'Type "yes" when you are ready to continue.' };
                    return await step.prompt(BEGIN_PROMPT, promptOptions);
                }
                else {
                    // music category is urban
                    userProfile.musicCategory = "urban";
                    await step.context.sendActivity(`Ah, so you like that ${music_category_user_map[userProfile.musicCategory]} kind of sound. How interesting!`);
                    const promptOptions = { prompt: 'Type "yes" when you are ready to continue.', retryPrompt: 'Type "yes" when you are ready to continue.' };
                    return await step.prompt(BEGIN_PROMPT, promptOptions);
                }
            }
            else if (lastChosenGenre == "early rock n roll" || lastChosenGenre == "soul/r&b") {
                // user is in step 4_3
                //console.log("STEP 4 - Question #3");

                if (lastChosenGenre == "early rock n roll") {
                    genre1_tally++;
                }
                else {
                    genre2_tally++;
                }

                if (genre1_tally > genre2_tally) {
                    // music category is campestral
                    userProfile.musicCategory = "campestral";
                    await step.context.sendActivity(`Ah, so you like that ${music_category_user_map[userProfile.musicCategory]} kind of sound. How interesting!`);
                    const promptOptions = { prompt: 'Type "yes" when you are ready to continue.', retryPrompt: 'Type "yes" when you are ready to continue.' };
                    return await step.prompt(BEGIN_PROMPT, promptOptions);
                }
                else {
                    // music category is mellow
                    userProfile.musicCategory = "mellow";
                    await step.context.sendActivity(`Ah, so you like that ${music_category_user_map[userProfile.musicCategory]} kind of sound. How interesting!`);
                    const promptOptions = { prompt: 'Type "yes" when you are ready to continue.', retryPrompt: 'Type "yes" when you are ready to continue.' };
                    return await step.prompt(BEGIN_PROMPT, promptOptions);
                }
            }
        }
        else {
            return await step.next();
        }
    }

    async explainLyricSurvey(step) {

        // TODO: Replace Elemental Image
        var img = "https://uhhmstorage.blob.core.windows.net/artwork/MC.png";
        var text = "Tight! It's MC over here.";
        await step.context.sendActivity({ attachments: [this.createHeroCard(img, text)] });

        await step.context.sendActivity("**Now I'm curious to learn about your taste in Hip Hop lyrics. Let me ask you a few more questions.**");
        const promptOptions = { prompt: 'Type "yes" when you are ready to explore your lyrical preferences.', retryPrompt: 'Type "yes" when you are ready to explore your lyrical preferences.' };
        return await step.prompt(BEGIN_PROMPT, promptOptions);
    }

    // LYRIC SURVEY
    // Question 1 of 5
    async lyricSurvey_1(step){
        // L1 = "1.“This is truffle season\n\nTom Ford tuxedos for no reason\n\nAll Saints for my angel\n\nAlexander Wang too”\n\nSuit and Tie, Justin Timberlake and Jay Z";
        // L2 = "2.“And still I see no changes can't a brother get a little peace\nIt's war on the streets and the war in the Middle East\nInstead of war on poverty they got a war on drugs\nSo the police can bother me”\n\nChanges, Tupac Shakur&B";
        // await step.context.sendActivity(L1);
        // await step.context.sendActivity(L2);

        await step.context.sendActivity("Between these two choices of Hip Hop lyrics, which do you like more?");

        lyric = "“This is truffle season\n\nTom Ford tuxedos for no reason\n\nAll Saints for my angel\n\nAlexander Wang too”";
        //var currentDir = process.cwd();
        //url = currentDir + "/lyricSurveyAudio/FL1_Suit_and_Tie.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/FL1_Suit_and_Tie.wav";
        songName = "Song 1: Suit and Tie";
        singerName = "Justin Timberlake and Jay Z";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });

        lyric = "“And still I see no changes can't a brother get a little peace\n\nIt's war on the streets and the war in the Middle East\n\nInstead of war on poverty they got a war on drugs\n\nSo the police can bother me”";
        //url = currentDir + "/lyricSurveyAudio/SIL1_Changes.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/SIL1_Changes.wav";
        songName = "Song 2: Changes";
        singerName = "Tupac Shakur";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });
        
        return await step.prompt(CHOICE_PROMPT, {
            prompt: '',
            choices: ChoiceFactory.toChoices(["Song 1", "Song 2"])
        });
    }
    // Question 2 of 5
    async lyricSurvey_2(step) {
        if (step.result.value.toLowerCase() == "song 1") {
            lyric_category_tally["FL"]++;
            userProfile.lyricSurveyChoices = ["FL1"];
        } else{
            lyric_category_tally["SIL"]++;
            userProfile.lyricSurveyChoices = ["SIL1"];
        }
        
        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        await step.context.sendActivity(transitions[rndInd]);

        // L1 = "1.“I must say, by your songs I'm unimpressed, hey\n\nBut I love to see a Black man get paid\n\nAnd plus, you havin' fun and I respect that\n\nBut have you ever thought about your impact?”\n\n1985, J. Cole";
        // L2 = "2.“In the concrete jungle, the strong stand and rumble \n\nThe weak fold and crumble, it's the land of trouble \n\nBrooklyn, home of the greatest rappers \n\nBig comes first, then the Queen comes after”\n\nLighters Up, Lil’ Kim";
        // await step.context.sendActivity(L1);
        // await step.context.sendActivity(L2);
        
        await step.context.sendActivity("Between these two choices of Hip Hop lyrics, which do you like more?");
        

        lyric = "“I must say, by your songs I'm unimpressed, hey\n\nBut I love to see a Black man get paid\n\nAnd plus, you havin' fun and I respect that\n\nBut have you ever thought about your impact?”";
        //var currentDir = process.cwd();
        //url = currentDir + "/lyricSurveyAudio/SIL2_1985.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/SIL2_1985.wav";
        songName = "Song 1: 1985";
        singerName = "J. Cole";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });

        lyric = "“In the concrete jungle, the strong stand and rumble \n\nThe weak fold and crumble, it's the land of trouble \n\nBrooklyn, home of the greatest rappers \n\nBig comes first, then the Queen comes after”";
        //url = currentDir + "/lyricSurveyAudio/LL1_Lighters_Up.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/LL1_Lighters_Up.wav";
        songName = "Song 2: Lighters Up";
        singerName = "Lil’ Kim";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });

        return await step.prompt(CHOICE_PROMPT, {
            prompt: '',
            choices: ChoiceFactory.toChoices(["Song 1", "Song 2"])
        });
        
    }
    // Question 3 of 5
    async lyricSurvey_3(step){
        if (step.result.value.toLowerCase() == "song 1"){
            lyric_category_tally["SIL"]++;
            userProfile.lyricSurveyChoices.push("SIL2");
        } else{
            lyric_category_tally["LL"]++;
            userProfile.lyricSurveyChoices.push("LL1");
        }

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        await step.context.sendActivity(transitions[rndInd]);
        
        // L1 = "1.“My motivation is from thirty pointers, VVS\n\nThe furniture my mouth piece simply symbolize success”\n\nGrillz, Nelly ft. Paul Wall, Ali & Gipp";
        // L2 = "2.“I drive a Benz and I got a lot of friends\n\nUp on the Concourse where Tremont ends\n\nOr Jerome Avenue or Gun Hill Road\n\nThe place where rap started in the days of old”\n\nThe Bronx, Kurtis Blow";
        // await step.context.sendActivity(L1);
        // await step.context.sendActivity(L2);

        await step.context.sendActivity("Between these two choices of Hip Hop lyrics, which do you like more?");
       

        lyric= "“My motivation is from thirty pointers, VVS\n\nThe furniture my mouth piece simply symbolize success”";
        //var currentDir = process.cwd();
        //url = currentDir + "/lyricSurveyAudio/FL2_Grillz.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/FL2_Grillz.wav";
        songName = "Song 1: Grillz";
        singerName = "Nelly ft. Paul Wall, Ali & Gipp";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });

        lyric= "“I drive a Benz and I got a lot of friends\n\nUp on the Concourse where Tremont ends\n\nOr Jerome Avenue or Gun Hill Road\n\nThe place where rap started in the days of old”";
        //url = currentDir + "/lyricSurveyAudio/LL2_The_Bronx.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/LL2_The_Bronx.wav";
        songName = "Song 2: The Bronx";
        singerName = "Kurtis Blow";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });

        return await step.prompt(CHOICE_PROMPT, {
            prompt: '',
            choices: ChoiceFactory.toChoices(["Song 1", "Song 2"])
        });
        
    }
    // Question 4 of 5
    async lyricSurvey_4(step){
        if (step.result.value.toLowerCase() == "song 1"){
            lyric_category_tally["FL"]++;
            userProfile.lyricSurveyChoices.push("FL2");
        } else{
            lyric_category_tally["LL"]++;
            userProfile.lyricSurveyChoices.push("LL1");
        }

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        await step.context.sendActivity(transitions[rndInd]);
        
        // L1 = "1.“I made 'Jesus Walks,' so I'm never going to hell\n\nCouture-level flow is never going on sale\n\nLuxury rap, the Hermes of verses\n\nSophisticated ignorance, write my curses in cursive”\n\nOtis, Kanye West and Jay-Z";
        // L2 = "2.“And with this love I do hip-hop from the soul\n\nA real MC, who never sweats how many copies are sold\n\nYeah I want to go gold, platinum, uh-huh etceteras\n\nBut why put out some wackness when no one will respect ya”\n\nPeace, Prosperity & Paper, A Tribe Called Quest";
        // await step.context.sendActivity(L1);
        // await step.context.sendActivity(L2);

        await step.context.sendActivity("Between these two choices of Hip Hop lyrics, which do you like more?");
  

        lyric= "“I made 'Jesus Walks,' so I'm never going to hell\n\nCouture-level flow is never going on sale\n\nLuxury rap, the Hermes of verses\n\nSophisticated ignorance, write my curses in cursive”";
        //var currentDir = process.cwd();
        //url = currentDir + "/lyricSurveyAudio/FL3_Otis.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/FL3_Otis.wav";
        songName = "Song 1: Otis";
        singerName = "Kanye West and Jay-Z";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });

        lyric= "“And with this love I do hip-hop from the soul\n\nA real MC, who never sweats how many copies are sold\n\nYeah I want to go gold, platinum, uh-huh etceteras\n\nBut why put out some wackness when no one will respect ya”";
        //url = currentDir + "/lyricSurveyAudio/SIL3_Peace_Prosperity_and_Paper.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/SIL3_Peace_Prosperity_and_Paper.wav";
        songName = "Song 2: Peace, Prosperity & Paper";
        singerName = "A Tribe Called Quest";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });

        return await step.prompt(CHOICE_PROMPT, {
            prompt: '',
            choices: ChoiceFactory.toChoices(["Song 1", "Song 2"])
        });
        
    }
    // Question 5 of 5
    async lyricSurvey_5(step){
        if (step.result.value.toLowerCase() == "song 1"){
            lyric_category_tally["FL"]++;
            userProfile.lyricSurveyChoices.push("FL3");
        } else{
            lyric_category_tally["SIL"]++;
            userProfile.lyricSurveyChoices.push("SIL3");
        }
        
        // L1 = "1.“Powdered eggs and government cheeses \n\nThe calendars with Martin, JFK and Jesus \n\nGotta be fresh to go to school with fly sneakers \n\nSchools with outdated books, we are the forgotten”\n\nThe Slave & The Master, Nas";
        // L2 = "2.“Sitting on they front stoop sipping Guinesses\n\nUsing native dialect in they sentences\n\nFrom the treeline blocks to the tenements\n\nTo the Mom & Pop local shop menaces”\n\nBrooklyn, Mos Def";
        // await step.context.sendActivity(L1);
        // await step.context.sendActivity(L2);

        var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
        await step.context.sendActivity(transitions[rndInd]);

        await step.context.sendActivity("Between these two choices of Hip Hop lyrics, which do you like more?");

        lyric = "“Powdered eggs and government cheeses \n\nThe calendars with Martin, JFK and Jesus \n\nGotta be fresh to go to school with fly sneakers \n\nSchools with outdated books, we are the forgotten”";
        //var currentDir = process.cwd();
        //url = currentDir + "/lyricSurveyAudio/SIL4_The_Master_and_the_Slave.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/SIL4_The_Master_and_the_Slave.wav";
        songName = "Song 1: The Slave & The Master";
        singerName = "Nas";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });

        lyric= "“Sitting on they front stoop sipping Guinesses\n\nUsing native dialect in they sentences\n\nFrom the treeline blocks to the tenements\n\nTo the Mom & Pop local shop menaces”";
        //url = currentDir + "/lyricSurveyAudio/LL3_Brooklyn.wav";
        url = "https://uhhmstorage.blob.core.windows.net/lyricsurveyaudio/LL3_Brooklyn.wav";
        songName = "Song 2: Brooklyn";
        singerName = "Mos Def";
        await step.context.sendActivity({ attachments: [this.createAudioCard(lyric, url, songName, singerName)] });

        return await step.prompt(CHOICE_PROMPT, {
            prompt: '',
            choices: ChoiceFactory.toChoices(["Song 1", "Song 2"])
        });
        
    }
    // Feedback on user's lyrical taste
    async lyricSurvey_final(step){
        if (step.result.value.toLowerCase() == "Song 1"){
            lyric_category_tally["SIL"]++;
            userProfile.lyricSurveyChoices.push("SIL4");
        } else{
            lyric_category_tally["LL"]++;
            userProfile.lyricSurveyChoices.push("LL3");
        }

        var max_key = Object.keys(lyric_category_tally).reduce(function(a, b){ return lyric_category_tally[a] > lyric_category_tally[b] ? a : b});
        var rnd = [max_key];

        for(var key in lyric_category_tally) {
            if(key === max_key) continue;
            if(lyric_category_tally[key] == lyric_category_tally[max_key]){
                rnd.push(key);
                max_key = rnd[Math.round(Math.random())]
                break;
            }
        }
        console.log(lyric_category_tally);
        console.log("User's Lyric Survey Choice: " + userProfile.lyricSurveyChoices);
        console.log(rnd, max_key);
        userProfile.lyricCategory = lyric_category_map[max_key];
        console.log("User's Lyric Category: " + userProfile.lyricCategory);

        console.log("User's Music Survey Choice: " + userProfile.musicSurveyChoices);
        console.log("User's Music Category: " + userProfile.musicCategory);
        console.log("Music Category User Map: " + music_category_user_map[userProfile.musicCategory]);

        await step.context.sendActivity("That's dope! So, it sounds like you’re into " + music_category_user_map[userProfile.musicCategory] + " music and care about Hip Hop music that deals with "+lyric_category_user_map[userProfile.lyricCategory]+".");
        const promptOptions = { prompt: 'Type "yes" when you are ready to continue.', retryPrompt: 'Type "yes" when you are ready to continue.' };
        return await step.prompt(BEGIN_PROMPT, promptOptions);
    }

    // NARRATIVE FLOW
    async explainNarrativeCustomization(step) {
        // TEMPORARY ASSIGNMENT OF LYRIC CATEGORY TO TEST BELOW COMPONENTS 
        //userProfile.lyricCategory = "Social Issues";

        // DETERMINE WHICH NARRATIVE TO PLAY FOR USER
        if (userProfile.lyricCategory == "Fashion") { //Fashion
            userProfile.narrative = Math.floor(Math.random() * 4 + 1);
        }
        else if (userProfile.lyricCategory == "Social Issues") { //Social Issues
            var min = 5;
            var max = 8;
            userProfile.narrative = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        else if (userProfile.lyricCategory == "Location") { //Location
            var min = 9;
            var max = 11;
            userProfile.narrative = Math.floor(Math.random() * (max - min + 1)) + min;
        }

        // DETERMINE WHICH PLAYLIST TO PLAY FOR USER
        if (userProfile.musicCategory == "mellow") {
            userProfile.playlist = "M" + userProfile.narrative.toString();
        }
        else if (userProfile.musicCategory == "urban") {
            userProfile.playlist = "U" + userProfile.narrative.toString();
        }
        else if (userProfile.musicCategory == "sophisticated") {
            userProfile.playlist = "S" + userProfile.narrative.toString();
        }
        else if (userProfile.musicCategory == "intense") {
            userProfile.playlist = "I" + userProfile.narrative.toString();
        }
        else if (userProfile.musicCategory == "campestral") {
            userProfile.playlist = "C" + userProfile.narrative.toString();
        }

        // TODO: Replace Elemental Image
        var img = "https://uhhmstorage.blob.core.windows.net/artwork/Breakdance.png";
        var text = "This is Breakdance taking over.";
        await step.context.sendActivity({ attachments: [this.createHeroCard(img, text)] });

        await step.context.sendActivity("**Based on all the information you gave us, we've created a customized narrative experience just for you!**");
        return step.next();
    }

    async introduceNarrative(step) {
        const promptOptions = { prompt: "Type 'yes' when you're ready to explore your narrative.", retryPrompt: "Type 'yes' when you're ready to explore your narrative." };

        return await step.prompt(BEGIN_PROMPT, promptOptions);
    }

    async beginNarrative(step) {
        var narrativeTitle_dictionary = ["",
            "Hip Hop, Punk Rock, Rock and Roll",
            "From the Streets to Fashion Week",
            "Brand Marketing Through Hip Hop",
            "Evolution of Bling",
            "Violence",
            "Drugs",
            "Self Representation of Women",
            "What Moves the Crowd",
            "Internet Streaming, Social Media, and Hip Hop",
            "From the Bronx to Across the U.S.",
            "Global Influence of Hip Hop"
        ];
        var narrativeTitle = narrativeTitle_dictionary[userProfile.narrative];

        console.log("User Narrative: " + userProfile.narrative.toString());
        console.log("User Narrative Title: " + narrativeTitle);
        console.log("User Playlist: " + userProfile.playlist);

        await step.context.sendActivity("**EXPLORE YOUR CUSTOM NARRATIVE:**");
        await step.context.sendActivity("**"+userProfile.lyricCategory + ": " + narrativeTitle+"**");

        return step.next();
    }

    async concludeNarrative(step) {
        const promptOptions = { prompt: "Type 'yes' when you're finished exploring your narrative.", retryPrompt: "Type 'yes' when you're finished exploring your narrative." };

        return await step.prompt(BEGIN_PROMPT, promptOptions);
    }

    // CONSENT FLOW

    async checkIfAdult(step) {

        // TODO: Replace Elemental Image
        var img = "https://uhhmstorage.blob.core.windows.net/artwork/Knowledge.png";
        var text = "Yo, it's Knowledge. Hope you enjoyed your narrative!";
        await step.context.sendActivity({ attachments: [this.createHeroCard(img, text)] });

        await step.context.sendActivity("**We wanna hear what you thought about the experience to help us research how to improve it.**");
        return await step.prompt(CHOICE_PROMPT, {
            prompt: "We can only use your feedback if you're over 18 years old, though. Are you over 18?",
            choices: ChoiceFactory.toChoices(['No', 'Yes'])
        });
    }

    async askConsent(step) {
        if (step.result.value == "Yes") {
            userIsAdult = true;
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Word! Can we share your feedback with MIT to make the future experience better?',
                choices: ChoiceFactory.toChoices(['No', 'Yes'])
            });
        }
        else {
            userIsAdult = false;
            await step.context.sendActivity("Word up. You've gotta be 18 or older to participate in the survey, but as a young person, you play a big role in impacting Hip Hop culture and history!");
            const promptOptions = { prompt: "Type 'yes' when you're ready to move on.", retryPrompt: "Type 'yes' when you're ready to move on." };
            return await step.prompt(BEGIN_PROMPT, promptOptions);
        }
        
    }

    async checkConsent(step) {
        if (userIsAdult) {
            if (step.result.value == "Yes") {
                userProfile.consent = true;
                await step.context.sendActivity("We really appreciate it, homie. Thanks for helping us make this experience even better for future visitors. We've got a few questions for you about your experience today.");
                return await step.next();
            }
            else {
                await step.context.sendActivity("No worries! Your information will not be saved.");
                const promptOptions = { prompt: "Type 'yes' when you're ready to move on.", retryPrompt: "Type 'yes' when you're ready to move on." };
                return await step.prompt(BEGIN_PROMPT, promptOptions);
            }
        }
        else {
            return await step.next();
        }
    }

    // POST-ASSESSMENT FLOW
    async askAge(step) {
        if (userProfile.consent) {
            const promptOptions = { prompt: 'Yo, please provide your age to continue.', retryPrompt: "You've gotta be between 18 and 120 years old." };
            return await step.prompt(NUMBER_PROMPT, promptOptions);
        }
        else {
            return step.next();
        }
    }

    async askGender(step) {
        if (userProfile.consent) {
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Got it. Please input your Gender.',
                choices: ChoiceFactory.toChoices(['Female', 'Male', 'Non-binary', 'Other'])
            });
        }
        else {
            return step.next();
        }
    }

    async checkGender(step) {
        if (userProfile.consent) {
            if (step.result.value == "Other") {
                return await step.prompt(NAME_PROMPT, `Cool. Please type in your gender`);
            }

            return await step.next(step.result.value);
        }
        else {
            return step.next();
        }
    }

    async explainPostAssessment(step) {
        if (userProfile.consent) {
            await step.context.sendActivity("Please indicate how you agree or disagree with each of the following statements:");
            return step.next();
        }
        else {
            return step.next();
        }
    }

    async postAssessment_0_1(step) {
        if (userProfile.consent) {
            return await step.prompt(CHOICE_PROMPT, {
                prompt: "I'm an experienced technology user.",
                choices: ChoiceFactory.toChoices(['Disagree', 'Neutral', 'Agree'])
            });
        }
        else {
            return step.next();
        }
    }

    async postAssessment_0_2(step) {
        if (userProfile.consent) {
            step.values.postAssessment_0_1 = step.result.value;

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I enjoy learning about new things using technology.',
                choices: ChoiceFactory.toChoices(['Disagree', 'Neutral', 'Agree'])
            });
        }
        else {
            return step.next();
        }
    }

    async postAssessment_1(step) {
        if (userProfile.consent) {
            step.values.postAssessment_0_2 = step.result.value;

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I found the experience to be easy to understand.',
                choices: ChoiceFactory.toChoices(['Disagree', 'Neutral', 'Agree'])
            });
        }
        else {
            return step.next();
        }
    }

    async postAssessment_2(step) {
        if (userProfile.consent) {
            step.values.postAssessment_1 = step.result.value;

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: ' I enjoyed the experience.',
                choices: ChoiceFactory.toChoices(['Disagree', 'Neutral', 'Agree'])
            });
        }
        else {
            return step.next();
        }
    }

    async postAssessment_3(step) {
        if (userProfile.consent) {
            step.values.postAssessment_2 = step.result.value;

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I learned something new about Hip Hop history and/or culture from the experience.',
                choices: ChoiceFactory.toChoices(['Disagree', 'Neutral', 'Agree'])
            });
        }
        else {
            return step.next();
        }
    }

    async postAssessment_4(step) {
        if (userProfile.consent) {
            step.values.postAssessment_3 = step.result.value;

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I felt like the experience was customized to fit my interests.',
                choices: ChoiceFactory.toChoices(['Disagree', 'Neutral', 'Agree'])
            });
        }
        else {
            return step.next();
        }
    }

    async postAssessment_5(step) {
        if (userProfile.consent) {
            step.values.postAssessment_4 = step.result.value;

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'I felt like the audio playlist was customized to fit my music preferences.',
                choices: ChoiceFactory.toChoices(['Disagree', 'Neutral', 'Agree'])
            });
        }
        else {
            return step.next();
        }
    }

    async postAssessment_6(step) {
        if (userProfile.consent) {
            step.values.postAssessment_5 = step.result.value;

            var rndInd = Math.floor(Math.random() * Object.keys(transitions).length);
            await step.context.sendActivity(transitions[rndInd]);

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Finally, how would you rate the Breakbeat Narrative experience overall on a scale from 1 to 5, with 1 being the worst possible experience and 5 being the best possible experience?',
                choices: ChoiceFactory.toChoices(['1', '2', '3', '4', '5'])
            });
        }
        else {
            return step.next();
        }
    }

    async checkRating(step) {
        if (userProfile.consent) {
            step.values.postAssessment_6 = step.result.value;

            //userProfile.postAssessment = [step.values.postAssessment_1, step.values.postAssessment_2, step.values.postAssessment_3, step.values.postAssessment_4, step.values.postAssessment_5, step.values.postAssessment_6]
            userProfile.postAssessment = [step.values.postAssessment_0_1, step.values.postAssessment_0_2, step.values.postAssessment_1, step.values.postAssessment_2, step.values.postAssessment_3, step.values.postAssessment_4, step.values.postAssessment_5, step.values.postAssessment_6]
            if (step.values.postAssessment_6 == 1 || step.values.postAssessment_6 == 2) {
                var checkRatingMsg = "I'm sorry that you didn't find the experience as interesting as we'd hoped, but your feedback will be very helpful for us to make it better!";
            }
            else if (step.values.postAssessment_6 == 3) {
                var checkRatingMsg = "I hope you were able to learn something new or interesting from the narrative experience and I'm glad to have had you participate.";
            }
            else if (step.values.postAssessment_6 == 4 || step.values.postAssessment_6 == 5) {
                var checkRatingMsg = "I'm so glad you enjoyed your customized narrative experience!";
            }
            await step.context.sendActivity(checkRatingMsg);
            await step.context.sendActivity("We definitely enjoyed getting to learn more about you today.");

            const promptOptions = { prompt: 'Type "yes" when you are ready to move on.', retryPrompt: 'Type "yes" when you are ready to move on.' };
            return await step.prompt(BEGIN_PROMPT, promptOptions);
        }
        else {
            return step.next();
        }
    }

    // CONCLUSION

    async endExperience_1(step) {
        await step.context.sendActivity("**Thanks again for joining us for the Breakbeat Narrative Experience! To get your custom music playlist, scan the QR code below with your mobile device camera.**");
        // Display QR code to playlist
        //var currentDir = process.cwd();
        //var QRcodeImg = currentDir + "/playlistQRCodes/" + userProfile.playlist + ".png";
        var QRcodeImg = "https://uhhmstorage.blob.core.windows.net/qrcodes/" + userProfile.playlist + ".png";
        var text = "Here's Your Custom [R]Evolution of Hip Hop Playlist!";
        await step.context.sendActivity({ attachments: [this.createHeroCard(QRcodeImg, text)] });
        //console.log("Path to QR code: " + QRcodeImg);

        return step.next();
    }

    async endExperience_2(step) {
        const promptOptions = { prompt: 'When you’re done, type "yes" to wrap this up.', retryPrompt: 'When you’re done, type "yes" to wrap this up.' };
        return await step.prompt(BEGIN_PROMPT, promptOptions);
    }

    async endExperience_3(step) {
        await step.context.sendActivity("Enjoy the rest of your day exploring the [R]Evolution of Hip Hop! Peace out.");
        return await step.endDialog();
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
        return promptContext.recognized.succeeded && promptContext.recognized.value > 17 && promptContext.recognized.value < 120;
    }

    async beginPromptValidator(promptContext) {
        // This condition is our validation rule. You can also change the value at this point.
        var str = new String(promptContext.recognized.value.toLowerCase());
        //console.log(str);
        return str.valueOf() === "yes".valueOf();
    }

    createAudioCard(lyric, url, songName, singerName) {
        return CardFactory.audioCard(
            songName,
            [url],
            CardFactory.actions([]),
            {
                subtitle: singerName,
                text: lyric,
                image: ""
            }
        );
    }

    createAnimationCard(url, title, text) {
        return CardFactory.animationCard(
            title,
            [
                { url: url }
            ],
            [],
            {
                subtitle: text
            }
        );
    }

    // imageCard usage
        // var img = 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg';
        // var text = "Scan the QR code with your camera to get your playlist";
        // await step.context.sendActivity({ attachments: [this.createHeroCard(img, text)] });
    createHeroCard(img, text) {
        return CardFactory.heroCard(
            text,
            CardFactory.images([img]),
            CardFactory.actions([])
        );
    }

}



module.exports.UserProfileDialog = UserProfileDialog;





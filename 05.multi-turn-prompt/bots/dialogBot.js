// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
var wel = false;

class DialogBot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
     

        this.onMembersAdded(async (context, next) => {
            console.log('Running dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            wel = false;
            for (const idx in context.activity.membersAdded) {
                if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                    await context.sendActivity(`Welcome to the [R]Evolution of Hip Hop Breakbeat Narrative Experience.`);
                    await context.sendActivity(`[Introduction of characters, explanation of what a hip hop elemental is]. I hope you’re as excited to be at the Universal Hip Hop Museum today as I am.`);
                    await context.sendActivity('To begin, I’d like to ask a few questions to get a sense of your feelings towards hip hop and music in general.');
                    wel = true;
                }
            }

         
            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            if(wel){
                await this.dialog.run(context, this.dialogState);
            }
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
    }
}

module.exports.DialogBot = DialogBot;
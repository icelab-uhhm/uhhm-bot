// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, CardFactory } = require('botbuilder');

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

                    // TODO: Replace Image of All 5 Elementals
                    var img = "https://uhhmstorage.blob.core.windows.net/artwork/AllElementals.png";
                    var text = "Welcome to the Breakbeat Narrative Experience.";
                    await context.sendActivity({ attachments: [this.createHeroCard(img, text)] });

                    await context.sendActivity("**We are the Hip Hop Elementals!**");
                    //await context.sendActivity("We embody the Five Cosmic Forces of Hip Hop:");
                    //await context.sendActivity("* **MC-ing**\n\n" + "* **DJ-ing**\n\n" + "* **Breakdance**\n\n" + "* **Graffiti**\n\n" + "* **Knowledge**");
                    await context.sendActivity("We embody the Five Cosmic Forces of Hip Hop:\n\n" + "* MC-ing\n\n" + "* DJ-ing\n\n" + "* Breakdance\n\n" + "* Graffiti\n\n" + "* Knowledge");

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

    createHeroCard(img, text) {
        return CardFactory.heroCard(
            text,
            CardFactory.images([img]),
            CardFactory.actions([])
        );
    }
}

module.exports.DialogBot = DialogBot;
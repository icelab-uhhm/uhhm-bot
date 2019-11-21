// By the MIT Center for Advanced Virtuality
// Licensed under a Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported (CC BY-NC-ND 3.0) License.

const { ActivityHandler, CardFactory, AttachmentLayoutTypes } = require('botbuilder');

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

                    // Image of All 5 Elementals
                    var img = "https://uhhmstorage.blob.core.windows.net/artwork/AllElementals.png";
                    var text = "Yo, we are the Hip Hop Elementals! \n\nWelcome to the Breakbeat Narrative Experience.";
                    await context.sendActivity({ attachments: [this.createHeroCard(img, text)] });

                    //await context.sendActivity("**Our names are:**\n\n" + "* MC\n\n" + "* DJ\n\n" + "* Breakdance\n\n" + "* Graffiti Art\n\n" + "* Knowledge");
                    await context.sendActivity("**Our names are:**");
                       
                    var img1 = "https://uhhmstorage.blob.core.windows.net/artwork/MC.png";
                    var img2 = "https://uhhmstorage.blob.core.windows.net/artwork/DJ.png";
                    var img3 = "https://uhhmstorage.blob.core.windows.net/artwork/Breakdance.png";
                    var img4 = "https://uhhmstorage.blob.core.windows.net/artwork/Graffiti.png";
                    var img5 = "https://uhhmstorage.blob.core.windows.net/artwork/Knowledge.png";

                    await context.sendActivity({
                        attachments: [
                            this.createHeroCard(img1, "MC"),
                            this.createHeroCard(img2, "DJ"),
                            this.createHeroCard(img3, "Breakdance"),
                            this.createHeroCard(img4, "Graffiti Art"),
                            this.createHeroCard(img5, "Knowledge")
                        ],
                        attachmentLayout: AttachmentLayoutTypes.Carousel
                    });

                    await context.sendActivity("We embody the Five Cosmic Forces of Hip Hop.");

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
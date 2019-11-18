// By the MIT Center for Advanced Virtuality
// Licensed under a Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported (CC BY-NC-ND 3.0) License.

class UserProfile {
    constructor(preAssessment, musicSurveyChoices, musicCategory, lyricSurveyChoices, lyricCategory, narrative, playlist, consent, age, gender, postAssessment, rating) {
        this.preAssessment = []; // tuple of responses for each of the questions

        this.musicSurveyChoices = []; // tuple containing genres user picked
        this.musicCategory = ""; // mellow, urban, sophisticated, intense, or campestral

        this.lyricSurveyChoices = []; // tuple containing lyrics user picked
        this.lyricCategory = ""; // fashion, location, social issues

        this.narrative = 0; // int = 1-11
        this.playlist = 0; // (Default|M|U|S|I|C)(1|2|3|4|5|6|7|8|9|10|11) e.g., M1 = Mellow playlist for narrative 1; Default5 = default playlist for narrative 5

        this.consent = false; // boolean
        this.postAssessment = []; // tuple of responses for each of the questions
        this.age = 0; // int >0 and <=120 
        this.gender = ""; // male, female, nonbinary, or string input 
        this.rating = 0; // int 1-5; 1 = lowest rating, 5 = highest rating
    }
}

module.exports.UserProfile = UserProfile;

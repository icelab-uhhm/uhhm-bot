// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class UserProfile {
    constructor(transport, name, age, gender, preAssessment) {
        this.transport = transport;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.preAssessment = preAssessment;
    }

    // NEW CODE FOR THE CONSTRUCTOR
    /*constructor(preAssessment, musicSurveyChoices, musicCategory, lyricSurveyChoices, lyricCategory, narrative, playlist, consent, age, gender, postAssessment, rating) {
        this.age = age; // int >0 and <=120
        this.gender = gender; // male, female, or string input (other)
        this.preAssessment = {}; // tuple of responses for each of the questions
        this.musicSurveyChoices = {}; // tuple containing genres user picked
        this.musicCategory = musicCategory; // mellow, urban, sophisticated, intense, or campestral
        this.lyricSurveyChoices = {}; // tuple containing lyrics user picked
        this.lyricCategory = lyricCategory; // fashion, location, social issues
        this.narrative = narrativeIndex; // int = 1-11
        this.playlist = playlistIndex; // (Default|M|U|S|I|C)(1|2|3|4|5|6|7|8|9|10|11) e.g., M1 = Mellow playlist for narrative 1; Default5 = default playlist for narrative 5
        this.postAssessment = {}; // tuple of responses for each of the questions
        this.consent = userConsents; // boolean
        this.rating = userRating; // int 1-5 (1 = lowest rating, 5 = highest rating)
    }*/
}

module.exports.UserProfile = UserProfile;

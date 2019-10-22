// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class UserProfile {
    // ORIGINAL CODE FOR THE CONSTRUCTOR
    //constructor(transport, name, age, gender, preAssessment) {
    //    this.transport = transport;
    //    this.name = name;
    //    this.age = age;
    //    this.gender = gender;
    //    this.preAssessment = preAssessment;
    //}

    // NEW CODE FOR THE CONSTRUCTOR
    constructor(preAssessment, musicSurveyChoices, musicCategory, lyricSurveyChoices, lyricCategory, narrative, playlist, consent, age, gender, postAssessment, rating) {
        this.age = 0; // int >0 and <=120 
        this.gender = ""; // male, female, or string input (other)
        this.preAssessment = []; // tuple of responses for each of the questions
        this.musicSurveyChoices = []; // tuple containing genres user picked
        this.musicCategory = ""; // mellow, urban, sophisticated, intense, or campestral
        this.lyricSurveyChoices = []; // tuple containing lyrics user picked
        this.lyricCategory = ""; // fashion, location, social issues
        this.narrative = 0; // int = 1-11
        this.playlist = 0; // (Default|M|U|S|I|C)(1|2|3|4|5|6|7|8|9|10|11) e.g., M1 = Mellow playlist for narrative 1; Default5 = default playlist for narrative 5
        this.postAssessment = []; // tuple of responses for each of the questions 
        this.consent = false; // boolean
        this.rating = 0; // int 1-5; 1 = lowest rating, 5 = highest rating
    }
}

module.exports.UserProfile = UserProfile;

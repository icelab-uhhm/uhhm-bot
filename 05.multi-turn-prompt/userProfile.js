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
}

module.exports.UserProfile = UserProfile;

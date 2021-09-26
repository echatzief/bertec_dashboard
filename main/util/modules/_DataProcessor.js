"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProcessor = void 0;
const constants_js_1 = require("../constants.js");
class DataProcessor {
    static calculateSymmetries(records, weight, validSteps) {
        let symmetries = {
            stance: 0,
            step: 0,
        };
        const { stance, step } = this.calculateTemporalSymmetry(records, weight, validSteps);
        symmetries.stance = stance;
        symmetries.step = step;
        console.log(symmetries);
        return symmetries;
    }
    static calculateTemporalSymmetry(records, weight, validSteps) {
        let leftFootIsLocked = false;
        let rightFootIsLocked = false;
        let leftFootStanceDuration = {
            startTimestamp: "",
            endTimestamp: ""
        };
        let rightFootStanceDuration = {
            startTimestamp: "",
            endTimestamp: ""
        };
        let leftFootStanceDurations = [];
        let rightFootStanceDurations = [];
        let stance = 0;
        let step = 0;
        // Calculate all the durations for every step
        for (var i = 0; i < records.length; i += constants_js_1.RAW_STEP) {
            let fz1 = Number(records[i].Fz1);
            var fz2 = Number(records[i].Fz2);
            var threshold = Number(constants_js_1.WEIGHT_THRESHOLD_PERCENT * weight);
            if (rightFootIsLocked) {
                if (fz2 < threshold) {
                    rightFootIsLocked = false;
                    rightFootStanceDuration.endTimestamp = records[i].Timestamp;
                    rightFootStanceDurations = [...rightFootStanceDurations, rightFootStanceDuration];
                }
            }
            else {
                if (fz2 > threshold) {
                    rightFootIsLocked = true;
                    rightFootStanceDuration = Object.assign({}, {
                        startTimestamp: "",
                        endTimestamp: ""
                    });
                    rightFootStanceDuration.startTimestamp = records[i].Timestamp;
                }
            }
            if (leftFootIsLocked) {
                if (fz1 < threshold) {
                    leftFootIsLocked = false;
                    leftFootStanceDuration.endTimestamp = records[i].Timestamp;
                    leftFootStanceDurations = [...leftFootStanceDurations, leftFootStanceDuration];
                }
            }
            else {
                if (fz1 > threshold) {
                    leftFootIsLocked = true;
                    leftFootStanceDuration = Object.assign({}, {
                        startTimestamp: "",
                        endTimestamp: ""
                    });
                    leftFootStanceDuration.startTimestamp = records[i].Timestamp;
                }
            }
        }
        // Include only the valid steps
        leftFootStanceDurations = validSteps ? leftFootStanceDurations.filter((_, idx) => validSteps.includes(`${idx + 1}`)) : leftFootStanceDurations;
        rightFootStanceDurations = validSteps ? rightFootStanceDurations.filter((_, idx) => validSteps.includes(`${idx + 1}`)) : rightFootStanceDurations;
        // Calculate the stance symmetry
        for (var i = 0; i < Math.min(leftFootStanceDurations.length, rightFootStanceDurations.length); i += 1) {
            if (rightFootStanceDurations[i].startTimestamp != rightFootStanceDurations[i].endTimestamp &&
                leftFootStanceDurations[i].startTimestamp != leftFootStanceDurations[i].endTimestamp) {
                if ((Number(rightFootStanceDurations[i].endTimestamp) - Number(rightFootStanceDurations[i].startTimestamp)) > (Number(leftFootStanceDurations[i].endTimestamp) - Number(leftFootStanceDurations[i].startTimestamp))) {
                    stance += (Number(leftFootStanceDurations[i].endTimestamp) - Number(leftFootStanceDurations[i].startTimestamp)) / (Number(rightFootStanceDurations[i].endTimestamp) - Number(rightFootStanceDurations[i].startTimestamp));
                    step += (Number(leftFootStanceDurations[i].endTimestamp) - Number(leftFootStanceDurations[i].startTimestamp) + Math.abs(Number(rightFootStanceDurations[i].endTimestamp) - Number(leftFootStanceDurations[i].startTimestamp))) / (Number(rightFootStanceDurations[i].endTimestamp) - Number(rightFootStanceDurations[i].startTimestamp) + Math.abs(Number(leftFootStanceDurations[i].endTimestamp) - Number(rightFootStanceDurations[i].startTimestamp)));
                }
                else {
                    stance += (Number(rightFootStanceDurations[i].endTimestamp) - Number(rightFootStanceDurations[i].startTimestamp)) / (Number(leftFootStanceDurations[i].endTimestamp) - Number(leftFootStanceDurations[i].startTimestamp));
                    step += (Number(rightFootStanceDurations[i].endTimestamp) - Number(rightFootStanceDurations[i].startTimestamp) + Math.abs(Number(leftFootStanceDurations[i].endTimestamp) - Number(rightFootStanceDurations[i].startTimestamp))) / (Number(leftFootStanceDurations[i].endTimestamp) - Number(leftFootStanceDurations[i].startTimestamp) + Math.abs(Number(rightFootStanceDurations[i].endTimestamp) - Number(leftFootStanceDurations[i].startTimestamp)));
                }
            }
        }
        return { stance, step };
    }
}
exports.DataProcessor = DataProcessor;

/******************************************************************************
    Copyright:: 2022- IBM, Inc
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 *****************************************************************************/

import { exec } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { Rule as RuleV4 } from "./v4/api/IRule";
import { Rule as RuleV2 } from "./v2/api/IEngine";

//requiring path and fs modules
const path = require('path');
const rulesV4 = require("./v4/rules");

function myExec(cmd: string) : Promise<string> {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error.message);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });    
    });
}

async function buildV4() {
    await myExec(`shx rm -rf ${path.join(__dirname, '..', 'dist', 'help')}`);
    try {
        await myExec(`shx mkdir ${path.join(__dirname, '..', 'dist')}`);
    } catch (err) {}
    await myExec(`shx cp -r ${path.join(__dirname, '..', 'help-v4')} ${path.join(__dirname, '..', 'dist', 'help')}`);

    for (const ruleId in rulesV4) {
        const rule : RuleV4 = rulesV4[ruleId];
        for (const locale in rule.help) {
            for (const reasonId in rule.help[locale]) {
                if (!rule.help[locale][reasonId] || rule.help[locale][reasonId].length === 0) continue;
                let helpPath = path.join(__dirname, '..', 'help-v4', locale, rule.help[locale][reasonId]);
                if (!existsSync(helpPath)) {
                    console.log("MISSING:",helpPath);
                    continue;
                }
                let helpFile = readFileSync(helpPath).toString();
                helpFile = helpFile.replace(/\<head\>/, `<head>
    <title>${rule.id} - Accessibility Checker Help</title>
    <script>
        RULE_MESSAGES = ${JSON.stringify(rule.messages)};
        RULE_ID = "${rule.id}"
    </script>
`)
                writeFileSync(path.join(__dirname, '..', 'dist', 'help', locale, rule.help[locale][reasonId]), helpFile);
            }
        }
    }
}

(async () => {
    await buildV4();
})();
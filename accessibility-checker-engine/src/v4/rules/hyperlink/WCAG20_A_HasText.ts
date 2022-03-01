import { ARIAMapper } from "../../../v2/aria/ARIAMapper";
import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../../api/IRule";
import { RPTUtil } from "../../../v2/checker/accessibility/util/legacy";
import { eRulePolicy, eToolkitLevel } from "../../api/IRule";

export let WCAG20_A_HasText: Rule = {
    id: "WCAG20_A_HasText",
    context: "aria:link",
    help: {
        "en-US": {
            "Pass_0": `WCAG20_A_HasText.html`,
            "Fail_1": `WCAG20_A_HasText.html`
        }
    },
    messages: {
        "en-US": {
            "group": "Hyperlinks must have a text description of their purpose",
            "Pass_0": "Hyperlink has a description of its purpose",
            "Fail_1": "Hyperlink has no link text, label or image with a text alternative"
        }
    },
    rulesets: [{
        id: [ "IBM_Accessibility", "WCAG_2_0", "WCAG_2_1"],
        num: "2.4.4", // num: [ "2.4.4", "x.y.z" ] also allowed
        level: eRulePolicy.VIOLATION,
        toolkitLevel: eToolkitLevel.LEVEL_TWO
    }],
    run: (context: RuleContext, options?: {}): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        if (ruleContext.hasAttribute("aria-hidden") && ruleContext.getAttribute("aria-hidden").toLowerCase() === "true") {
            return null;
        }
        // Rule only passes if an element has inner content,
        // in the case that there is only hidden content under the the element it is a violation
        let passed =
            ARIAMapper.computeName(ruleContext).trim().length > 0
            || RPTUtil.nonTabableChildCheck(ruleContext);
        if (!passed) {
            return RuleFail("Fail_1");
        } else {
            return RulePass("Pass_0");
        }
    }
}

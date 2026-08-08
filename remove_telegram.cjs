const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove showTelegramModal state
content = content.replace(/\/\/ Telegram Mandatory Join Modal State[\s\S]*?const \[showTelegramModal, setShowTelegramModal\] = useState<boolean>\(\(\) => \{[\s\S]*?try \{[\s\S]*?return localStorage\.getItem\('dsssb_joined_telegram'\) !== 'true';[\s\S]*?\} catch \(_\) \{[\s\S]*?return true;[\s\S]*?\}[\s\S]*?\}\);\n/, '');

// Remove the JSX block
// Need to find the end of the Modal. 
const startComment = "{/* Mandatory Telegram Channel Join Popup Modal */}";
const startIndex = content.indexOf(startComment);
if (startIndex !== -1) {
    let nextCommentIndex = content.indexOf("{/* Footer */}", startIndex);
    if (nextCommentIndex === -1) {
        nextCommentIndex = content.indexOf("</motion.div>", startIndex); // Just to find some stopping point
    }
    
    // We can just use string replacement if we know it ends right before the closing div of the app.
}


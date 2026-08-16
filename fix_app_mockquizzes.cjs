const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import
content = content.replace(/import \{ mockQuizzes \} from '\.\/data\/mockQuizzes';\n/g, "");

// Replace usage of mockQuizzes with staticQuizzes, but watch out because staticQuizzes is already being merged with customQuizzes.
// Where it says: [...mockQuizzes, ...staticQuizzes, ...customQuizzes]
// change it to: [...staticQuizzes, ...customQuizzes]
content = content.replace(/\.\.\.mockQuizzes,\s*/g, "");

// Replace `mockQuizzes.some` -> `staticQuizzes.some`
content = content.replace(/mockQuizzes\.some/g, "staticQuizzes.some");
content = content.replace(/mockQuizzes\.find/g, "staticQuizzes.find");
content = content.replace(/mockQuizzes\.filter/g, "staticQuizzes.filter");
content = content.replace(/mockQuizzes\.forEach/g, "staticQuizzes.forEach");
content = content.replace(/mockQuizzes\.reduce/g, "staticQuizzes.reduce");
content = content.replace(/mockQuizzes/g, "staticQuizzes");

fs.writeFileSync('src/App.tsx', content, 'utf8');


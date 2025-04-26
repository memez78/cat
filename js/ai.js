// Advanced AI Chat Assistant with Age-Appropriate Learning
class AIAssistant {
    constructor() {
        this.userAge = 0;
        this.userMode = 'kid'; // kid, teen, adult, parent
        this.learningProgress = {};
        this.currentTopic = null;
        this.assessmentMode = false;
        
        // Age-appropriate content filters
        this.ageFilters = {
            kid: {
                maxComplexity: 1,
                vocabulary: 'simple',
                examples: 'cartoons',
                tone: 'friendly'
            },
            teen: {
                maxComplexity: 2,
                vocabulary: 'moderate',
                examples: 'social media',
                tone: 'casual'
            },
            adult: {
                maxComplexity: 3,
                vocabulary: 'technical',
                examples: 'work',
                tone: 'professional'
            },
            parent: {
                maxComplexity: 3,
                vocabulary: 'technical',
                examples: 'family',
                tone: 'informative'
            }
        };

        // Knowledge base with complexity levels
        this.knowledgeBase = {
            'passwords': {
                1: [
                    'Think of your password like a secret superhero code!',
                    'Never share your password, even with friends!',
                    'Use different passwords for different games and apps.',
                    'Make your password long and fun to remember!'
                ],
                2: [
                    'Create strong passwords with letters, numbers, and symbols.',
                    'Use a password manager to keep track of different passwords.',
                    'Enable two-factor authentication when available.',
                    'Change your passwords regularly.'
                ],
                3: [
                    'Implement multi-factor authentication for critical accounts.',
                    'Use passphrases instead of simple passwords.',
                    'Consider biometric authentication methods.',
                    'Monitor password breach notifications.'
                ]
            },
            'privacy': {
                1: [
                    'Keep your personal information secret!',
                    'Ask a grown-up before sharing photos.',
                    'Don\'t tell strangers your real name or where you live.',
                    'Use nicknames in games instead of your real name.'
                ],
                2: [
                    'Review privacy settings on social media.',
                    'Be careful what you post online.',
                    'Think before accepting friend requests.',
                    'Understand data collection policies.'
                ],
                3: [
                    'Implement comprehensive privacy policies.',
                    'Understand GDPR and privacy regulations.',
                    'Use encryption for sensitive data.',
                    'Regular privacy audits and assessments.'
                ]
            },
            'online_safety': {
                1: [
                    'Only visit websites your parents say are okay.',
                    'If something scary appears, tell a grown-up!',
                    'Don\'t click on pop-up messages.',
                    'Stay on kid-friendly websites.'
                ],
                2: [
                    'Verify website security certificates.',
                    'Be cautious with downloads.',
                    'Recognize phishing attempts.',
                    'Use secure networks.'
                ],
                3: [
                    'Implement network security protocols.',
                    'Understand threat vectors and mitigation.',
                    'Regular security assessments.',
                    'Incident response planning.'
                ]
            }
        };

        // Learning assessments
        this.assessments = {
            'passwords': {
                1: [
                    {
                        question: 'Should you share your password with your best friend?',
                        answer: false,
                        explanation: 'Never share your passwords with anyone, even best friends!'
                    },
                    {
                        question: 'Is "password123" a strong password?',
                        answer: false,
                        explanation: 'Simple passwords are easy to guess. Use a mix of letters, numbers, and symbols!'
                    }
                ],
                2: [
                    {
                        question: 'Is it good to use the same password for all your accounts?',
                        answer: false,
                        explanation: 'Use different passwords for different accounts to stay safe!'
                    }
                ],
                3: [
                    {
                        question: 'Should you enable two-factor authentication when available?',
                        answer: true,
                        explanation: 'Two-factor authentication adds an extra layer of security!'
                    }
                ]
            }
            // Add more assessments for other topics
        };

        this.init();
    }

    init() {
        const chatForm = document.getElementById('chatForm');
        const chatInput = document.getElementById('chatInput');
        const aiMode = document.getElementById('aiMode');

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message) {
                this.addMessage('user', message);
                this.processMessage(message);
                chatInput.value = '';
            }
        });

        // Load user preferences
        this.loadUserPreferences();
    }

    setUserMode(mode) {
        this.userMode = mode;
        document.getElementById('aiMode').textContent = this.getModeDisplay(mode);
        this.addMessage('system', `AI Assistant adjusted for ${this.getModeDisplay(mode)} mode.`);
    }

    getModeDisplay(mode) {
        const displays = {
            kid: 'Kid-Friendly',
            teen: 'Teen',
            adult: 'Professional',
            parent: 'Parent Guide'
        };
        return displays[mode] || 'Standard';
    }

    addMessage(type, text) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        
        if (type === 'assessment') {
            messageDiv.className += ' assessment-message';
        }
        
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    processMessage(message) {
        const lowerMessage = message.toLowerCase();

        // Check if in assessment mode
        if (this.assessmentMode) {
            this.handleAssessmentResponse(message);
            return;
        }

        // Check for special commands
        if (lowerMessage.includes('start assessment')) {
            this.startAssessment();
            return;
        }

        if (lowerMessage.includes('help')) {
            this.showHelp();
            return;
        }

        // Regular conversation processing
        const response = this.generateResponse(message);
        this.addMessage('ai', response);

        // Randomly offer assessment
        if (Math.random() < 0.2) { // 20% chance
            setTimeout(() => {
                this.offerAssessment();
            }, 1000);
        }
    }

    generateResponse(message) {
        const mode = this.ageFilters[this.userMode];
        let response = '';

        // Identify topic
        const topic = this.identifyTopic(message);
        if (topic) {
            const responses = this.knowledgeBase[topic][mode.maxComplexity];
            response = responses[Math.floor(Math.random() * responses.length)];

            // Add age-appropriate examples
            response += this.generateExample(topic, mode);
        } else {
            response = this.getDefaultResponse();
        }

        return this.formatResponse(response, mode.tone);
    }

    identifyTopic(message) {
        const topics = {
            passwords: ['password', 'secret', 'login', 'account'],
            privacy: ['private', 'personal', 'share', 'information'],
            online_safety: ['safe', 'danger', 'website', 'internet']
        };

        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
                return topic;
            }
        }

        return null;
    }

    generateExample(topic, mode) {
        const examples = {
            passwords: {
                kid: ' For example, instead of "cat", use "H@ppyC@t123"!',
                teen: ' Like using "Basketball2023!" instead of just "basketball".',
                adult: ' Consider using a passphrase like "Correct-Horse-Battery-Staple".',
                parent: ' Teach your children to use memorable phrases with numbers and symbols.'
            }
        };

        return examples[topic]?.[mode.vocabulary] || '';
    }

    formatResponse(response, tone) {
        const toneModifiers = {
            friendly: ['Hey there! ', 'Cool! ', 'Awesome! '],
            casual: ['So, ', 'Here\'s the thing: ', 'Check this out - '],
            professional: ['', 'Consider this: ', 'Important: '],
            informative: ['Note: ', 'Key point: ', 'Remember: ']
        };

        const modifier = toneModifiers[tone][Math.floor(Math.random() * toneModifiers[tone].length)];
        return modifier + response;
    }

    startAssessment() {
        this.assessmentMode = true;
        this.currentAssessmentIndex = 0;
        this.currentTopic = 'passwords'; // Start with passwords, can be randomized
        
        this.addMessage('system', 'Starting a quick knowledge check! Ready?');
        this.askAssessmentQuestion();
    }

    askAssessmentQuestion() {
        const assessment = this.assessments[this.currentTopic][this.ageFilters[this.userMode].maxComplexity];
        if (this.currentAssessmentIndex < assessment.length) {
            const question = assessment[this.currentAssessmentIndex].question;
            this.addMessage('assessment', `Question ${this.currentAssessmentIndex + 1}: ${question} (Answer with Yes or No)`);
        } else {
            this.completeAssessment();
        }
    }

    handleAssessmentResponse(message) {
        const assessment = this.assessments[this.currentTopic][this.ageFilters[this.userMode].maxComplexity];
        const current = assessment[this.currentAssessmentIndex];
        const userAnswer = message.toLowerCase().includes('yes');
        
        if (userAnswer === current.answer) {
            this.addMessage('system', '✅ Correct! ' + current.explanation);
        } else {
            this.addMessage('system', '❌ Not quite. ' + current.explanation);
        }

        this.currentAssessmentIndex++;
        setTimeout(() => {
            this.askAssessmentQuestion();
        }, 1500);
    }

    completeAssessment() {
        this.assessmentMode = false;
        this.addMessage('system', 'Great job completing the assessment! Keep learning and staying safe online! 🌟');
        
        // Update learning progress
        if (!this.learningProgress[this.currentTopic]) {
            this.learningProgress[this.currentTopic] = 0;
        }
        this.learningProgress[this.currentTopic] += 1;
        
        // Save progress
        this.saveUserPreferences();
    }

    offerAssessment() {
        this.addMessage('system', 'Would you like to test your knowledge with a quick assessment? Type "start assessment" to begin!');
    }

    showHelp() {
        const helpMessage = `
            I'm your Cyber Security Assistant! I can help you with:
            - Password safety
            - Online privacy
            - Internet safety
            - Knowledge assessments
            
            Just ask me anything or type "start assessment" to test your knowledge!
        `;
        this.addMessage('system', helpMessage);
    }

    saveUserPreferences() {
        const data = {
            userMode: this.userMode,
            learningProgress: this.learningProgress
        };
        localStorage.setItem('aiAssistantPrefs', JSON.stringify(data));
    }

    loadUserPreferences() {
        const saved = localStorage.getItem('aiAssistantPrefs');
        if (saved) {
            const data = JSON.parse(saved);
            this.userMode = data.userMode;
            this.learningProgress = data.learningProgress;
            document.getElementById('aiMode').textContent = this.getModeDisplay(this.userMode);
        }
    }
}

// Initialize AI when chat screen is shown
document.addEventListener('DOMContentLoaded', () => {
    let ai = null;
    
    // Watch for screen changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'aiChat' && 
                mutation.target.style.display === 'block' && 
                !ai) {
                ai = new AIAssistant();
            }
        });
    });
    
    observer.observe(document.getElementById('aiChat'), {
        attributes: true,
        attributeFilter: ['style']
    });
}); 
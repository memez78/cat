class AICompanion {
    constructor(userData) {
        this.userData = userData;
        this.personality = this.initializePersonality();
        this.learningStyle = this.determineLearningStyle();
        this.riskAssessment = new RiskAssessment(userData);
        this.interventions = [];
        this.lastInteraction = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.scheduleCheckIns();
        this.loadInteractionHistory();
    }

    initializePersonality() {
        // Adapt personality based on user age and type
        const personalities = {
            kid: {
                tone: 'friendly and playful',
                language: 'simple and encouraging',
                avatar: 'playful-cat',
                encouragementStyle: 'immediate and frequent',
                interventionStyle: 'gentle and supportive'
            },
            teen: {
                tone: 'casual but respectful',
                language: 'relatable and understanding',
                avatar: 'cool-cat',
                encouragementStyle: 'balanced and authentic',
                interventionStyle: 'empathetic and non-judgmental'
            },
            adult: {
                tone: 'professional and direct',
                language: 'mature and informative',
                avatar: 'professional-cat',
                encouragementStyle: 'achievement-focused',
                interventionStyle: 'analytical and solution-oriented'
            },
            parent: {
                tone: 'supportive and informative',
                language: 'clear and guidance-oriented',
                avatar: 'mentor-cat',
                encouragementStyle: 'progress-focused',
                interventionStyle: 'educational and preventive'
            }
        };

        return personalities[this.getUserCategory()];
    }

    determineLearningStyle() {
        // Implement VARK learning style assessment
        return {
            visual: 0.4,
            auditory: 0.2,
            reading: 0.2,
            kinesthetic: 0.2
        };
    }

    getUserCategory() {
        const { age, userType } = this.userData;
        if (userType === 'parent') return 'parent';
        if (age < 13) return 'kid';
        if (age < 18) return 'teen';
        return 'adult';
    }

    async generateResponse(input) {
        // Process user input and generate contextual response
        const context = {
            userHistory: await this.getInteractionHistory(),
            currentMood: this.assessUserMood(input),
            timeOfDay: this.getTimeContext(),
            recentActivities: await this.getRecentActivities(),
            riskFactors: this.riskAssessment.getCurrentRisks()
        };

        const response = await this.processWithContext(input, context);
        this.updateInteractionHistory(input, response);
        return this.formatResponse(response);
    }

    assessUserMood(input) {
        // Implement sentiment analysis for mood detection
        const sentimentScore = this.analyzeSentiment(input);
        return {
            valence: sentimentScore.valence,
            arousal: sentimentScore.arousal,
            dominance: sentimentScore.dominance
        };
    }

    analyzeSentiment(text) {
        // Simple sentiment analysis implementation
        const positiveWords = new Set(['happy', 'good', 'great', 'awesome', 'fun']);
        const negativeWords = new Set(['sad', 'bad', 'angry', 'frustrated', 'worried']);
        
        const words = text.toLowerCase().split(/\W+/);
        let valence = 0;
        let arousal = 0;
        let dominance = 0;

        words.forEach(word => {
            if (positiveWords.has(word)) valence += 1;
            if (negativeWords.has(word)) valence -= 1;
            // Add more sophisticated analysis here
        });

        return { valence, arousal, dominance };
    }

    getTimeContext() {
        const hour = new Date().getHours();
        return {
            timeOfDay: hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening',
            isWeekend: [0, 6].includes(new Date().getDay()),
            isSchoolTime: hour >= 8 && hour <= 15 && ![0, 6].includes(new Date().getDay())
        };
    }

    async getRecentActivities() {
        // Fetch user's recent activities from storage
        const activities = await this.loadActivities();
        return this.analyzeActivityPatterns(activities);
    }

    analyzeActivityPatterns(activities) {
        return {
            frequentTopics: this.extractFrequentTopics(activities),
            engagementLevel: this.calculateEngagement(activities),
            riskBehaviors: this.identifyRiskBehaviors(activities),
            improvements: this.trackImprovements(activities)
        };
    }

    async processWithContext(input, context) {
        // Generate response based on context and personality
        const baseResponse = await this.generateBaseResponse(input);
        return this.adaptResponseToContext(baseResponse, context);
    }

    adaptResponseToContext(response, context) {
        // Adapt response based on user's context
        if (context.currentMood.valence < 0) {
            response = this.addEmotionalSupport(response);
        }

        if (context.riskFactors.length > 0) {
            response = this.addSafetyGuidance(response, context.riskFactors);
        }

        return this.styleResponse(response);
    }

    styleResponse(response) {
        // Apply personality-based styling
        const style = this.personality;
        return {
            message: response,
            tone: style.tone,
            emoji: this.selectAppropriateEmoji(),
            animation: this.selectAnimation(),
            emphasis: this.identifyKeyPoints(response)
        };
    }

    addEmotionalSupport(response) {
        const supportiveMessages = {
            kid: ["It's okay to feel that way! Let's find something fun to do together!"],
            teen: ["I hear you. That sounds tough. Want to talk about it?"],
            adult: ["I understand your concern. Let's look at this objectively."],
            parent: ["Parenting can be challenging. Here's what might help..."]
        };

        return `${response}\n\n${supportiveMessages[this.getUserCategory()]}`;
    }

    addSafetyGuidance(response, risks) {
        const guidance = risks.map(risk => this.getSafetyTip(risk)).join('\n');
        return `${response}\n\nStay safe: ${guidance}`;
    }

    getSafetyTip(risk) {
        const tips = {
            'excessive_time': 'Remember to take regular breaks!',
            'inappropriate_content': 'If something doesn\'t feel right, talk to a trusted adult.',
            'privacy_risk': 'Keep your personal information private.',
            'cyberbullying': 'Don\'t engage with bullies - save evidence and tell someone.',
            'addiction_risk': 'Let\'s set healthy limits together.'
        };
        return tips[risk] || 'Stay alert and practice safe online habits!';
    }

    scheduleCheckIns() {
        // Schedule regular check-ins based on user patterns
        const checkInTimes = this.calculateOptimalCheckInTimes();
        checkInTimes.forEach(time => {
            this.scheduleNotification(time);
        });
    }

    calculateOptimalCheckInTimes() {
        // Analyze user activity patterns to determine best check-in times
        const activeHours = this.getActiveHours();
        return this.distributedCheckInTimes(activeHours);
    }

    getActiveHours() {
        // Analyze user's typical active hours
        return {
            weekday: ['09:00', '15:00', '19:00'],
            weekend: ['11:00', '16:00', '20:00']
        };
    }

    scheduleNotification(time) {
        // Schedule a check-in notification
        const message = this.generateCheckInMessage(time);
        // Implementation for scheduling notification
    }

    generateCheckInMessage(time) {
        const templates = {
            kid: [
                "Hey friend! Ready for a new adventure?",
                "Time to learn something cool!",
                "Your cyber friend misses you!"
            ],
            teen: [
                "Quick check-in: How's your online day going?",
                "Got a minute to level up your cyber skills?",
                "New challenges await!"
            ],
            adult: [
                "Time for a security check-in",
                "Review your online safety status",
                "New security tips available"
            ],
            parent: [
                "Review your child's online activity",
                "New safety recommendations available",
                "Time for a family cyber safety check"
            ]
        };

        return templates[this.getUserCategory()][Math.floor(Math.random() * 3)];
    }

    async loadInteractionHistory() {
        try {
            const history = await localStorage.getItem('interactionHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading interaction history:', error);
            return [];
        }
    }

    async updateInteractionHistory(input, response) {
        try {
            const history = await this.loadInteractionHistory();
            history.push({
                timestamp: new Date().toISOString(),
                input,
                response,
                mood: this.assessUserMood(input),
                context: this.getTimeContext()
            });
            localStorage.setItem('interactionHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Error updating interaction history:', error);
        }
    }
}

class RiskAssessment {
    constructor(userData) {
        this.userData = userData;
        this.riskFactors = new Set();
        this.riskThresholds = this.initializeThresholds();
    }

    initializeThresholds() {
        return {
            screenTime: {
                kid: 2 * 60, // 2 hours in minutes
                teen: 4 * 60,
                adult: 6 * 60
            },
            contentRisk: {
                kid: 0.3, // 30% threshold for risky content
                teen: 0.5,
                adult: 0.7
            }
        };
    }

    getCurrentRisks() {
        return Array.from(this.riskFactors);
    }

    assessTimeUsage(dailyMinutes) {
        const threshold = this.riskThresholds.screenTime[this.userData.userType];
        if (dailyMinutes > threshold) {
            this.riskFactors.add('excessive_time');
        }
    }

    assessContentExposure(content) {
        // Implement content risk assessment
    }

    assessBehaviorPatterns(activities) {
        // Implement behavior pattern analysis
    }
}

export default AICompanion; 
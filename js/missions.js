// Game Missions System
class MissionsSystem {
    constructor() {
        this.currentMission = null;
        this.completedMissions = new Set();
        this.userProgress = {
            level: 1,
            experience: 0,
            badges: new Set(),
            achievements: new Set()
        };

        // Mission categories by age group
        this.missionCategories = {
            kid: ['Password Hero', 'Safe Explorer', 'Privacy Guardian'],
            teen: ['Social Media Master', 'Digital Detective', 'Cyber Defender'],
            adult: ['Security Specialist', 'Privacy Professional', 'Network Guardian'],
            parent: ['Family Protector', 'Digital Guide', 'Safety Mentor']
        };

        // Mission definitions with age-appropriate content
        this.missions = {
            kid: [
                {
                    id: 'password_basics',
                    category: 'Password Hero',
                    title: 'Create Your First Super Password!',
                    description: 'Learn to make a strong password using the power of symbols and numbers!',
                    difficulty: 1,
                    minAge: 6,
                    maxAge: 12,
                    objectives: [
                        'Create a password with at least 8 characters',
                        'Include at least one number',
                        'Include at least one special character'
                    ],
                    rewards: {
                        experience: 100,
                        badge: 'Password Rookie',
                        items: ['Password Shield']
                    },
                    tips: [
                        'Think of your favorite animal and add numbers',
                        'Use ! or @ to make it stronger',
                        'Never use your real name or birthday'
                    ]
                },
                {
                    id: 'safe_browsing_intro',
                    category: 'Safe Explorer',
                    title: 'Web Safety Adventure',
                    description: 'Learn how to spot safe websites and avoid dangerous ones!',
                    difficulty: 1,
                    minAge: 6,
                    maxAge: 12,
                    objectives: [
                        'Identify the padlock symbol in browsers',
                        'Learn to ask parents before visiting new sites',
                        'Spot advertisement pop-ups'
                    ],
                    rewards: {
                        experience: 150,
                        badge: 'Safe Surfer',
                        items: ['Safety Compass']
                    },
                    tips: [
                        'Look for the green padlock',
                        'Stay on kid-friendly websites',
                        'Never click on flashing ads'
                    ]
                }
            ],
            teen: [
                {
                    id: 'social_media_safety',
                    category: 'Social Media Master',
                    title: 'Social Media Security Challenge',
                    description: 'Master the art of staying safe on social media platforms!',
                    difficulty: 2,
                    minAge: 13,
                    maxAge: 17,
                    objectives: [
                        'Set up privacy settings on social media',
                        'Learn about safe sharing practices',
                        'Identify fake profiles and scams'
                    ],
                    rewards: {
                        experience: 200,
                        badge: 'Social Guardian',
                        items: ['Profile Shield']
                    },
                    tips: [
                        'Review your privacy settings regularly',
                        'Think before accepting friend requests',
                        'Be careful what you share publicly'
                    ]
                },
                {
                    id: 'digital_footprint',
                    category: 'Digital Detective',
                    title: 'Digital Footprint Investigation',
                    description: 'Learn how to manage your online presence and protect your reputation!',
                    difficulty: 2,
                    minAge: 13,
                    maxAge: 17,
                    objectives: [
                        'Understand what makes up your digital footprint',
                        'Learn to clean up old posts and content',
                        'Set up Google alerts for your name'
                    ],
                    rewards: {
                        experience: 250,
                        badge: 'Digital Tracker',
                        items: ['Reputation Guard']
                    },
                    tips: [
                        'Google yourself regularly',
                        'Use privacy-focused search engines',
                        'Think before you post'
                    ]
                }
            ],
            adult: [
                {
                    id: 'advanced_security',
                    category: 'Security Specialist',
                    title: 'Advanced Security Protocols',
                    description: 'Master advanced security measures for personal and professional use.',
                    difficulty: 3,
                    minAge: 18,
                    maxAge: 99,
                    objectives: [
                        'Set up two-factor authentication',
                        'Create a password management system',
                        'Implement encryption for sensitive data'
                    ],
                    rewards: {
                        experience: 300,
                        badge: 'Security Expert',
                        items: ['Encryption Key']
                    },
                    tips: [
                        'Use different passwords for work and personal accounts',
                        'Regular security audits are important',
                        'Keep software updated'
                    ]
                }
            ],
            parent: [
                {
                    id: 'family_safety',
                    category: 'Family Protector',
                    title: 'Family Online Safety Setup',
                    description: 'Create a safe online environment for your family.',
                    difficulty: 3,
                    minAge: 18,
                    maxAge: 99,
                    objectives: [
                        'Set up parental controls',
                        'Create family sharing guidelines',
                        'Establish screen time rules'
                    ],
                    rewards: {
                        experience: 350,
                        badge: 'Family Guardian',
                        items: ['Family Shield']
                    },
                    tips: [
                        'Regular family discussions about online safety',
                        'Lead by example',
                        'Keep communication open'
                    ]
                }
            ]
        };

        this.init();
    }

    init() {
        this.loadProgress();
        this.setupEventListeners();
        this.updateMissionDisplay();
    }

    setupEventListeners() {
        // Mission selection
        document.getElementById('missionsList').addEventListener('click', (e) => {
            if (e.target.classList.contains('mission-card')) {
                this.selectMission(e.target.dataset.missionId);
            }
        });

        // Mission completion
        document.getElementById('completeMissionBtn')?.addEventListener('click', () => {
            if (this.currentMission) {
                this.completeMission(this.currentMission.id);
            }
        });
    }

    getMissionsByAgeGroup(ageGroup) {
        return this.missions[ageGroup] || [];
    }

    selectMission(missionId) {
        const mission = this.findMissionById(missionId);
        if (!mission) return;

        this.currentMission = mission;
        this.updateMissionDisplay();
        this.showMissionDetails(mission);
    }

    findMissionById(missionId) {
        for (const ageGroup of Object.keys(this.missions)) {
            const mission = this.missions[ageGroup].find(m => m.id === missionId);
            if (mission) return mission;
        }
        return null;
    }

    completeMission(missionId) {
        const mission = this.findMissionById(missionId);
        if (!mission || this.completedMissions.has(missionId)) return;

        // Award rewards
        this.userProgress.experience += mission.rewards.experience;
        this.userProgress.badges.add(mission.rewards.badge);
        this.completedMissions.add(missionId);

        // Level up check
        this.checkLevelUp();

        // Update display
        this.updateMissionDisplay();
        this.saveProgress();
        this.showRewardAnimation(mission.rewards);
    }

    checkLevelUp() {
        const experienceNeeded = this.userProgress.level * 1000;
        if (this.userProgress.experience >= experienceNeeded) {
            this.userProgress.level++;
            this.showLevelUpAnimation();
        }
    }

    showMissionDetails(mission) {
        const detailsContainer = document.getElementById('missionDetails');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <h2>${mission.title}</h2>
            <p class="mission-description">${mission.description}</p>
            <div class="mission-objectives">
                <h3>Objectives:</h3>
                <ul>
                    ${mission.objectives.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
            </div>
            <div class="mission-tips">
                <h3>Tips:</h3>
                <ul>
                    ${mission.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            <div class="mission-rewards">
                <h3>Rewards:</h3>
                <p>Experience: ${mission.rewards.experience}</p>
                <p>Badge: ${mission.rewards.badge}</p>
                <p>Items: ${mission.rewards.items.join(', ')}</p>
            </div>
        `;
    }

    updateMissionDisplay() {
        const container = document.getElementById('missionsList');
        if (!container) return;

        const userAgeGroup = this.getUserAgeGroup();
        const missions = this.getMissionsByAgeGroup(userAgeGroup);

        container.innerHTML = missions.map(mission => `
            <div class="mission-card ${this.completedMissions.has(mission.id) ? 'completed' : ''}" 
                 data-mission-id="${mission.id}">
                <div class="mission-header">
                    <h3>${mission.title}</h3>
                    <span class="difficulty-badge">Level ${mission.difficulty}</span>
                </div>
                <p>${mission.description}</p>
                <div class="mission-progress">
                    ${this.completedMissions.has(mission.id) 
                        ? '<span class="completed-badge">✓ Completed</span>'
                        : '<button class="start-mission-btn">Start Mission</button>'}
                </div>
            </div>
        `).join('');
    }

    getUserAgeGroup() {
        // This should be set based on user profile or selection
        return localStorage.getItem('userAgeGroup') || 'kid';
    }

    showRewardAnimation(rewards) {
        // Create floating rewards animation
        const rewardDiv = document.createElement('div');
        rewardDiv.className = 'reward-animation';
        rewardDiv.innerHTML = `
            <div class="reward-content">
                <h3>Mission Complete!</h3>
                <p>+${rewards.experience} XP</p>
                <p>New Badge: ${rewards.badge}</p>
            </div>
        `;
        document.body.appendChild(rewardDiv);

        // Remove after animation
        setTimeout(() => {
            rewardDiv.remove();
        }, 3000);
    }

    showLevelUpAnimation() {
        const levelUpDiv = document.createElement('div');
        levelUpDiv.className = 'level-up-animation';
        levelUpDiv.innerHTML = `
            <div class="level-up-content">
                <h2>Level Up!</h2>
                <p>You are now level ${this.userProgress.level}</p>
            </div>
        `;
        document.body.appendChild(levelUpDiv);

        setTimeout(() => {
            levelUpDiv.remove();
        }, 3000);
    }

    saveProgress() {
        localStorage.setItem('missionProgress', JSON.stringify({
            completedMissions: Array.from(this.completedMissions),
            userProgress: {
                ...this.userProgress,
                badges: Array.from(this.userProgress.badges),
                achievements: Array.from(this.userProgress.achievements)
            }
        }));
    }

    loadProgress() {
        const saved = localStorage.getItem('missionProgress');
        if (saved) {
            const data = JSON.parse(saved);
            this.completedMissions = new Set(data.completedMissions);
            this.userProgress = {
                ...data.userProgress,
                badges: new Set(data.userProgress.badges),
                achievements: new Set(data.userProgress.achievements)
            };
        }
    }
}

// Initialize missions system when missions screen is shown
document.addEventListener('DOMContentLoaded', () => {
    let missions = null;
    
    // Watch for screen changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'missions' && 
                mutation.target.style.display === 'block' && 
                !missions) {
                missions = new MissionsSystem();
            }
        });
    });
    
    observer.observe(document.getElementById('missions'), {
        attributes: true,
        attributeFilter: ['style']
    });
}); 
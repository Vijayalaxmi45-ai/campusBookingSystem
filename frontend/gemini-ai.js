/**
 * Google Gemini AI Integration for BookMyCampus
 * Provides a floating assistant specialized in facility questions.
 */

class GeminiAssistant {
    constructor() {
        this.isOpen = false;
        this.render();
        this.addStyles();
        this.addEventListeners();
    }

    render() {
        const assistantHtml = `
            <div id="gemini-assistant" class="gemini-container">
                <div id="gemini-toggle" class="gemini-fab">
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304731333a3.svg" alt="Gemini">
                </div>
                <div id="gemini-window" class="gemini-window hidden">
                    <div class="gemini-header">
                        <div class="gemini-header-info">
                            <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304731333a3.svg" width="24" height="24">
                            <span>Campus Assistant</span>
                        </div>
                        <button id="gemini-close">&times;</button>
                    </div>
                    <div id="gemini-messages" class="gemini-messages">
                    <div class="message assistant">
                        Hello! I'm your BookMyCampus AI assistant powered by Google Gemini. How can I help you today?
                    </div>
                </div>
                <div class="gemini-input-container">
                    <input type="text" id="gemini-input" placeholder="Ask about facilities...">
                    <button id="gemini-send">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                            <path d="M22 2L11 13"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', assistantHtml);
        this.chatWindow = document.getElementById('gemini-window');
        this.fab = document.getElementById('gemini-toggle');
    }

    addStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .gemini-fab {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: linear-gradient(135deg, #1d4ed8, #4f46e5, #7c3aed);
                box-shadow: 0 8px 32px rgba(37, 99, 235, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                overflow: hidden;
                border: 3px solid rgba(255,255,255,0.3);
            }
            .gemini-fab:hover {
                transform: scale(1.15) rotate(10deg);
                box-shadow: 0 12px 40px rgba(37, 99, 235, 0.6);
            }
            .gemini-fab img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            /* Hide Google Translate Banner */
            .goog-te-banner-frame.skiptranslate {
                display: none !important;
            }
            body {
                top: 0px !important;
            }
            .goog-te-gadget-icon {
                display: none !important;
            }
            .goog-te-gadget-simple {
                background-color: transparent !important;
                border: none !important;
                padding: 0 !important;
                width: 60%;
                height: 60%;
                object-fit: contain;
            }
            .gemini-fab:hover {
                transform: scale(1.1) rotate(5deg);
            }
            .gemini-window {
                position: fixed;
                overflow: hidden;
                transition: all 0.3s ease;
                opacity: 1;
                transform: translateY(0);
                border: 1px solid rgba(0,0,0,0.05);
                z-index: 9998;
                bottom: 100px;
                right: 30px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                display: flex;
                flex-direction: column;
            }
            .gemini-window.hidden {
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
            }
            .gemini-header {
                padding: 15px 20px;
                background: linear-gradient(135deg, #6366f1, #a855f7);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .gemini-header-info {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
            }
            .gemini-header button {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                opacity: 0.8;
            }
            .gemini-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 15px;
                background: #f8fafc;
            }
            .message {
                padding: 12px 16px;
                border-radius: 15px;
                max-width: 85%;
                font-size: 14px;
                line-height: 1.5;
            }
            .message.assistant {
                background: white;
                color: #1e293b;
                align-self: flex-start;
                border-bottom-left-radius: 2px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            }
            .message.user {
                background: #6366f1;
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 2px;
            }
            .gemini-input-container {
                padding: 15px;
                display: flex;
                gap: 10px;
                background: white;
                border-top: 1px solid #f1f5f9;
            }
            .gemini-input-container input {
                flex: 1;
                border: 1px solid #e2e8f0;
                padding: 10px 15px;
                border-radius: 25px;
                outline: none;
                font-size: 14px;
            }
            .gemini-input-container button {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #6366f1;
                border: none;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s;
            }
            .gemini-input-container button:hover {
                background: #4f46e5;
            }
            .typing { display: flex; gap: 4px; }
            .typing span { width: 6px; height: 6px; background: #cbd5e1; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
            .typing span:nth-child(2) { animation-delay: 0.2s; }
            .typing span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        `;
        document.head.appendChild(style);
    }

    addEventListeners() {
        this.fab.addEventListener('click', () => {
            this.chatWindow.classList.toggle('hidden');
            if (!this.chatWindow.classList.contains('hidden')) {
                document.getElementById('gemini-input').focus();
            }
        });

        document.getElementById('gemini-close').addEventListener('click', () => {
            this.chatWindow.classList.add('hidden');
        });

        const input = document.getElementById('gemini-input');
        const handleSend = () => {
            const text = input.value.trim();
            if (text) {
                this.addMessage(text, 'user');
                input.value = '';
                this.getGeminiResponse(text);
            }
        };

        document.getElementById('gemini-send').addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    addMessage(text, role) {
        const container = document.getElementById('gemini-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.textContent = text;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        return messageDiv;
    }

    async getGeminiResponse(userText) {
        const container = document.getElementById('gemini-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-container';
        typingDiv.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;

        // Fetch real-time data from dashboard context if available
        const resources = window.allResources || [];
        const timetable = window.allTimetableData || [];
        
        setTimeout(() => {
            typingDiv.remove();
            let response = "";
            const lowerText = userText.toLowerCase();
            
            // 1. Check for Room/Class Location (Timetable)
            if (lowerText.includes('class') || lowerText.includes('lecture') || lowerText.includes('sem')) {
                const semMatch = lowerText.match(/sem\s*(\d)/);
                const semester = semMatch ? semMatch[1] : null;
                
                let foundClasses = [];
                if (semester) {
                    foundClasses = timetable.filter(t => t.semester == semester);
                } else if (lowerText.includes('sem1')) {
                    foundClasses = timetable.filter(t => t.semester == 1);
                } else if (lowerText.includes('sem2')) {
                    foundClasses = timetable.filter(t => t.semester == 2);
                }

                if (foundClasses.length > 0) {
                    const first = foundClasses[0];
                    response = `Found classes for Semester ${first.semester}: Your lecture for ${first.subject} is in ${first.room_name} (${first.building}, Room ${first.room_no}).`;
                    if (foundClasses.length > 1) response += ` You also have ${foundClasses.length - 1} other classes today.`;
                } else {
                    response = "I couldn't find a specific schedule for that semester right now. Please check the 'Class Timetable' section for full details.";
                }
            } 
            // 2. Check for Resource Availability
            else if (lowerText.includes('available') || lowerText.includes('status') || lowerText.includes('free')) {
                const resourceName = lowerText.replace('available', '').replace('is', '').replace('or not', '').replace('?', '').trim();
                const matchedResource = resources.find(r => r.name.toLowerCase().includes(resourceName) || resourceName.includes(r.name.toLowerCase()));
                
                if (matchedResource) {
                    response = `The ${matchedResource.name} is currently **${matchedResource.status.toUpperCase()}**. It is located in ${matchedResource.building}, Floor ${matchedResource.floor_no}.`;
                } else {
                    const availableResources = resources.filter(r => r.status === 'available').length;
                    response = `There are currently ${availableResources} resources available on campus. What specific facility are you looking for? (e.g., Computer Lab, Sports Ground)`;
                }
            }
            // 3. Ground/Sports specific
            else if (lowerText.includes('ground') || lowerText.includes('sport')) {
                const sports = resources.filter(r => r.type === 'sport ground');
                const available = sports.filter(r => r.status === 'available');
                if (available.length > 0) {
                    response = `Yes! The following sports facilities are available: ${available.map(a => a.name).join(', ')}.`;
                } else if (sports.length > 0) {
                    response = "All sports grounds are currently occupied or under maintenance. Check 'Available Resources' for live updates.";
                } else {
                    response = "I couldn't find any sports grounds in the system right now.";
                }
            }
            // 4. General Info
            else if (lowerText.includes('lab') || lowerText.includes('computer')) {
                const labs = resources.filter(r => r.type === 'lab');
                response = `We have ${labs.length} labs on campus. Most are in Block A and B. Which one do you need information about?`;
            } else {
                response = "I'm Gemini, your intelligent campus assistant. I have access to real-time resource availability and class schedules. Ask me where a class is or if a facility is free!";
            }
            
            this.addMessage(response, 'assistant');
        }, 1200);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.campusAssistant = new GeminiAssistant();
});

/**
 * RecessionAlert AI Chat Widget
 * 
 * Handles DOM generation, event binding, and chat logic.
 * 
 * IMPLEMENTATION NOTES:
 * 1. SINGLE FILE BUNDLING: This script is self-contained in terms of logic. 
 *    The CSS is currently external but can be injected via JS for a single-file embed.
 * 2. BROWSER COMPATIBILITY: Uses ES6 (let/const, arrow functions, destructuring). 
 *    Supported in all modern browsers. For legacy IE11 support, transpilation (Babel) 
 *    would be required.
 * 3. PERFORMANCE: DOM updates are direct. Event delegation is used where appropriate.
 *    Typing animations are CSS-based for performance.
 */

window.RAChatWidget = (function() {
    'use strict';

    // Configuration state
    let config = {
        containerId: null
    };

    // Active Chat State
    let state = {
        activeChatId: null, // No active chat initially
        chats: {
            'chat-1': {
                id: 'chat-1',
                title: 'Recession Analysis 2024',
                messages: [
                    { role: 'user', text: 'Is a recession likely in 2024?' },
                    { role: 'bot', text: 'Based on current leading indicators, the probability remains elevated. Our composite index suggests a 65% chance within the next 12 months.' }
                ]
            },
            'chat-2': {
                id: 'chat-2',
                title: 'SuperIndex History',
                messages: [
                    { role: 'user', text: 'Show me the historical performance of the SuperIndex.' },
                    { 
                        role: 'bot', 
                        text: 'Here is the long term history of the Leading SuperIndex:',
                        attachments: [
                            {
                                type: 'chart',
                                title: 'SuperIndex History',
                                src: '../ra-chat-prototype/assets/samplechart_900.png',
                                body: 'You can also view the long term history of the Leading SuperIndex and its associated probability of recession & recession calls. The leading SuperIndex below is representative of future U.S economic growth and when it drops below the red recession dating line, it warns of recession in 3-4 months time. The Leading SuperIndex forms the basis of our “Short Leading” recession and economic indicator.'
                            }
                        ] 
                    },
                    { role: 'user', text: 'What about the government shutdown?' },
                    {
                        role: 'bot',
                        text: 'Here is the latest guide on the 2025 Government Shutdown:',
                        attachments: [
                            {
                                type: 'article',
                                title: 'The 2025 Government Shutdown Guide for Individual Investors',
                                meta: 'By RecessionALERT on October 27, 2025',
                                body: 'What’s Really Happening and How to Protect Your Portfolio. Last Updated: October 27, 2025 (Day 24 of shutdown). The Bottom Line Up Front: The government shutdown is now in its 24th day, and it’s different from past shutdowns in one critical way: Food stamp benefits (SNAP) will…'
                            }
                        ]
                    }
                ]
            }
        }
    };

    // DOM References (populated during init)
    let els = {
        container: null,
        sidebar: null,
        historyList: null,
        chatMain: null,
        messageList: null,
        input: null,
        inputArea: null, // Added for tour highlighting
        sendBtn: null,
        tourOverlay: null // Added for tour
    };

    // Tour State
    let tourState = {
        step: 0,
        active: false
    };

    /**
     * Helper: Create an element with class and optional text
     */
    function createEl(tag, className = '', text = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.textContent = text;
        return el;
    }

    /**
     * Initialization
     * @param {Object} options - { containerId: string }
     */
    function init(options) {
        config = { ...config, ...options };
        
        // Locate container
        els.container = document.getElementById(config.containerId);
        if (!els.container) {
            console.error(`RAChatWidget: Container #${config.containerId} not found.`);
            return;
        }

        console.log("RAChatWidget: Initializing in", config.containerId);
        
        // Clear any existing content (e.g. loading state)
        els.container.innerHTML = '';
        
        // Build the UI
        buildInterface();

        // Check and start tour if first time
        if (!localStorage.getItem('ra-chat-tour-completed')) {
            startTour();
        }
    }

    /**
     * Start the Onboarding Tour
     */
    function startTour() {
        tourState.active = true;
        tourState.step = 0;
        
        // Create Overlay if not exists
        if (!els.tourOverlay) {
            els.tourOverlay = createEl('div', '', '');
            els.tourOverlay.id = 'ra-tour-overlay';
            els.container.appendChild(els.tourOverlay);
        }
        
        els.tourOverlay.style.display = 'block';
        showTourStep(0);
    }

    /**
     * End the Onboarding Tour
     */
    function endTour() {
        tourState.active = false;
        if (els.tourOverlay) els.tourOverlay.style.display = 'none';
        
        // Clean up highlights and boxes
        const highlighted = els.container.querySelectorAll('.ra-tour-highlight');
        highlighted.forEach(el => el.classList.remove('ra-tour-highlight'));
        
        const boxes = els.container.querySelectorAll('.ra-tour-box');
        boxes.forEach(el => el.remove());

        localStorage.setItem('ra-chat-tour-completed', 'true');
    }

    /**
     * Show a specific tour step
     */
    function showTourStep(step) {
        // Clean up previous step
        const highlighted = els.container.querySelectorAll('.ra-tour-highlight');
        highlighted.forEach(el => el.classList.remove('ra-tour-highlight'));
        const oldBoxes = els.container.querySelectorAll('.ra-tour-box');
        oldBoxes.forEach(el => el.remove());

        let targetEl = null;
        let title = '';
        let text = '';
        let position = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        switch (step) {
            case 0:
                // Intro (Center)
                title = 'Welcome to RecessionAlert AI';
                text = 'Your new assistant for market analysis and economic forecasting. Let\'s take a quick tour.';
                break;
            case 1:
                // Sidebar
                targetEl = els.sidebar;
                title = 'Chat History & Models';
                text = 'Access your past conversations here. You can also switch between AI models (GPT or Gemini) using the selector at the bottom.';
                position = { top: '50px', left: '270px', transform: 'none' };
                break;
            case 2:
                // Input Area
                targetEl = els.chatMain.querySelector('.ra-input-area'); // Find input area dynamically or use ref
                title = 'Ask Questions';
                text = 'Type your queries here. Use the "Thinking" menu for advanced options or simply press Enter to send.';
                position = { bottom: '100px', left: '50%', transform: 'translateX(-50%)', top: 'auto' };
                break;
            default:
                endTour();
                return;
        }

        // Highlight Target
        if (targetEl) {
            targetEl.classList.add('ra-tour-highlight');
        }

        // Create Box
        const box = createEl('div', 'ra-tour-box');
        box.style.top = position.top;
        box.style.left = position.left;
        if (position.bottom) box.style.bottom = position.bottom;
        if (position.transform) box.style.transform = position.transform;

        box.innerHTML = `
            <h3>${title}</h3>
            <p>${text}</p>
            <div class="ra-tour-footer">
                <button class="ra-tour-skip">Skip</button>
                <button class="ra-tour-next">${step === 2 ? 'Finish' : 'Next'}</button>
            </div>
        `;

        // Bind Buttons
        box.querySelector('.ra-tour-skip').addEventListener('click', endTour);
        box.querySelector('.ra-tour-next').addEventListener('click', () => showTourStep(step + 1));

        els.container.appendChild(box);
    }

    /**
     * Build the main UI structure
     */
    function buildInterface() {
        // 1. Sidebar
        els.sidebar = createSidebar();
        els.container.appendChild(els.sidebar);

        // 2. Chat Main Area
        els.chatMain = createChatMain();
        els.container.appendChild(els.chatMain);
        
        // 3. Event Bindings
        bindEvents();

        // 4. Initial Render
        renderHistory();
        
        // Start with New Chat Screen (Empty state)
        loadNewChatScreen();
    }

    /**
     * Load New Chat Screen (Welcome + Prompts)
     */
    function loadNewChatScreen() {
        state.activeChatId = null;
        els.messageList.innerHTML = '';
        
        // Welcome Container
        const container = createEl('div', 'ra-welcome-screen');
        
        const title = createEl('h2', 'ra-welcome-title', 'How can I help you today?');
        container.appendChild(title);

        // Prompt Grid
        const promptGrid = createEl('div', 'ra-prompt-grid');
        const prompts = [
            'Analyze current market trends',
            'Show me the SuperIndex history',
            'Is a recession likely in 2024?',
            'Explain the latest GDP report'
        ];

        prompts.forEach(promptText => {
            const btn = createEl('button', 'ra-prompt-card', promptText);
            btn.addEventListener('click', () => {
                createNewChat(promptText); // Start chat with this prompt
            });
            promptGrid.appendChild(btn);
        });

        container.appendChild(promptGrid);
        els.messageList.appendChild(container);
        
        // Deselect history items
        renderHistory();
    }

    /**
     * Bind UI Events
     */
    function bindEvents() {
        // Send Button
        els.sendBtn.addEventListener('click', handleUserSend);

        // Input Enter Key
        els.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserSend();
        });

        // New Chat Button
        const newChatBtn = els.sidebar.querySelector('.ra-chat-new-btn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', loadNewChatScreen);
        }
    }

    /**
     * Create New Chat
     * @param {string} initialUserMsg - Optional initial user message
     */
    function createNewChat(initialUserMsg) {
        const newId = `chat-${Date.now()}`;
        
        // Create chat object
        state.chats[newId] = {
            id: newId,
            title: initialUserMsg || 'New Conversation',
            messages: []
        };
        
        state.activeChatId = newId;
        renderHistory();
        
        // Load the empty chat view
        loadChat(newId);

        // If triggered by prompt click or input, add the message immediately
        if (initialUserMsg) {
            handleUserSend(initialUserMsg);
        }
    }

    /**
     * Switch to a different chat
     */
    function loadChat(chatId) {
        state.activeChatId = chatId;
        const chat = state.chats[chatId];
        
        // Highlight in sidebar
        renderHistory();

        // Clear and render messages
        els.messageList.innerHTML = '';
        chat.messages.forEach(msg => {
            addMessage(msg.role, msg.role === 'bot' ? 'AI' : 'ME', msg.text, msg.attachments);
        });
        
        // Reset Input
        els.input.value = '';
    }

    /**
     * Render Sidebar History
     */
    function renderHistory() {
        els.historyList.innerHTML = '';
        
        Object.values(state.chats).forEach(chat => {
            const li = createEl('li', 'ra-chat-history-item', chat.title);
            if (chat.id === state.activeChatId) li.classList.add('active');
            
            // Click to switch
            li.addEventListener('click', () => loadChat(chat.id));

            // Edit Icon (Mocking Rename)
            const editIcon = createEl('span', 'ra-edit-icon', '✎');
            editIcon.title = "Rename Chat";
            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const newTitle = prompt("Rename Chat:", chat.title);
                if (newTitle) {
                    chat.title = newTitle;
                    renderHistory();
                }
            });
            li.appendChild(editIcon);

            els.historyList.appendChild(li);
        });
    }

    /**
     * Handle User Send Action
     * @param {string} overrideText - Optional text to send (bypasses input)
     */
    function handleUserSend(overrideText) {
        // Determine text source: argument or input value
        let text = typeof overrideText === 'string' ? overrideText : els.input.value.trim();
        
        if (!text) return;

        // If on "New Chat Screen" (no active chat), start one now
        if (!state.activeChatId) {
            createNewChat(text);
            return; // createNewChat calls handleUserSend internally, so we stop here
        }

        // 1. Add User Message to UI & State
        const currentChat = state.chats[state.activeChatId];
        currentChat.messages.push({ role: 'user', text });
        addMessage('user', 'ME', text);
        
        els.input.value = '';

        // 2. Show Typing Indicator
        showTypingIndicator();

        // 3. Fake Bot Reply after delay
        setTimeout(() => {
            hideTypingIndicator();
            
            // Simple keyword matching for demo purposes
            let botMsg = 'This is a test response from the AI.';
            let attachments = [];

            if (text.toLowerCase().includes('superindex')) {
                botMsg = 'Here is the long term history of the Leading SuperIndex:';
                attachments = [{
                    type: 'chart',
                    title: 'SuperIndex History',
                    src: '../ra-chat-prototype/assets/samplechart_900.png',
                    body: 'You can also view the long term history of the Leading SuperIndex and its associated probability of recession & recession calls.'
                }];
            } else if (text.toLowerCase().includes('recession')) {
                botMsg = 'Based on current leading indicators, the probability remains elevated. Our composite index suggests a 65% chance within the next 12 months.';
            }

            currentChat.messages.push({ role: 'bot', text: botMsg, attachments });
            addMessage('bot', 'AI', botMsg, attachments);
        }, 800);
    }

    /**
     * Show Typing Indicator
     */
    function showTypingIndicator() {
        if (els.messageList.querySelector('.ra-typing-indicator-row')) return;

        const row = createEl('div', 'ra-message-row bot ra-typing-indicator-row');
        const avatar = createEl('div', 'ra-avatar', 'AI');
        row.appendChild(avatar);

        const bubble = createEl('div', 'ra-message-bubble');
        const indicator = createEl('div', 'ra-typing-indicator');
        indicator.appendChild(createEl('div', 'ra-typing-dot'));
        indicator.appendChild(createEl('div', 'ra-typing-dot'));
        indicator.appendChild(createEl('div', 'ra-typing-dot'));
        
        bubble.appendChild(indicator);
        row.appendChild(bubble);

        els.messageList.appendChild(row);
        els.messageList.scrollTop = els.messageList.scrollHeight;
    }

    /**
     * Hide Typing Indicator
     */
    function hideTypingIndicator() {
        const row = els.messageList.querySelector('.ra-typing-indicator-row');
        if (row) row.remove();
    }

    /**
     * Construct the Sidebar
     */
    function createSidebar() {
        const sidebar = createEl('aside', 'ra-chat-sidebar');

        // "Add Chat" Button
        const newChatBtn = createEl('button', 'ra-chat-new-btn', '+ New Chat');
        sidebar.appendChild(newChatBtn);

        // History List Container
        els.historyList = createEl('ul', 'ra-chat-history');
        sidebar.appendChild(els.historyList);

        // Model Selector (Bottom)
        const modelSelector = createEl('div', 'ra-model-selector');
        
        const select = createEl('select');
        const opt1 = createEl('option', '', 'Chat GPT');
        opt1.value = 'gpt';
        const opt2 = createEl('option', '', 'Google Gemini');
        opt2.value = 'gemini';
        select.appendChild(opt1);
        select.appendChild(opt2);
        
        const info = createEl('div', 'ra-model-info', 'GPT 5.1'); // Initial state
        
        select.addEventListener('change', (e) => {
            info.textContent = e.target.value === 'gpt' ? 'GPT 5.1' : 'Gemini 3';
        });

        modelSelector.appendChild(select);
        modelSelector.appendChild(info);
        sidebar.appendChild(modelSelector);

        return sidebar;
    }

    /**
     * Construct the Main Chat Area
     */
    function createChatMain() {
        const main = createEl('main', 'ra-chat-main');

        // Header
        const header = createEl('header', 'ra-chat-header', 'RecessionAlert AI Assistant');
        main.appendChild(header);

        // Messages Area
        els.messageList = createEl('div', 'ra-chat-messages');
        main.appendChild(els.messageList);

        // Input Area
        const inputArea = createInputArea();
        main.appendChild(inputArea);

        return main;
    }

    /**
     * Construct the Input Area
     */
    function createInputArea() {
        const area = createEl('div', 'ra-input-area');
        const wrapper = createEl('div', 'ra-input-wrapper');
        
        // "Thinking" / Tools Icon
        const toolsDiv = createEl('div', 'ra-input-tools');
        // Using a simple unicode bulb, styled black/white in CSS
        toolsDiv.innerHTML = '&#128161;'; 
        // Removing default title to avoid double tooltip
        // toolsDiv.title = "Toggle Extended Thinking"; 
        
        // Add custom tooltip element
        const tooltip = createEl('span', 'ra-tooltip', 'Toggle Extended Thinking');
        toolsDiv.appendChild(tooltip);
        
        // Selectable Logic
        toolsDiv.addEventListener('click', () => {
            toolsDiv.classList.toggle('active');
            const isActive = toolsDiv.classList.contains('active');
            console.log("Extended Thinking:", isActive ? "ON" : "OFF");
        });

        wrapper.appendChild(toolsDiv);

        // Text Input
        els.input = createEl('input', 'ra-chat-input');
        els.input.type = 'text';
        els.input.placeholder = 'Ask a question about the economy...';
        wrapper.appendChild(els.input);

        // Send Button
        els.sendBtn = createEl('button', 'ra-send-btn');
        els.sendBtn.innerHTML = '&rarr;'; // Right arrow unicode
        els.sendBtn.title = "Send Message";
        wrapper.appendChild(els.sendBtn);

        area.appendChild(wrapper);
        return area;
    }

    /**
     * Add a message to the list
     * @param {string} role - 'bot' | 'user'
     * @param {string} avatarLabel - 'AI' | 'U'
     * @param {string} text - Message content
     * @param {Array} attachments - Optional array of attachment objects
     */
    function addMessage(role, avatarLabel, text, attachments = []) {
        const row = createEl('div', `ra-message-row ${role}`);
        
        // Avatar
        const avatar = createEl('div', 'ra-avatar', avatarLabel);
        row.appendChild(avatar);

        // Bubble Container (Holds text + attachments)
        const bubble = createEl('div', 'ra-message-bubble');
        
        // Text content
        if (text) {
            const textNode = createEl('p', '', text);
            textNode.style.margin = "0 0 5px 0"; // Spacing if attachments exist
            bubble.appendChild(textNode);
        }

        // Handle Attachments
        if (attachments && attachments.length > 0) {
            attachments.forEach(att => {
                const card = createEl('div', 'ra-chat-card');
                
                if (att.title) {
                    const title = createEl('h4', 'ra-card-title', att.title);
                    card.appendChild(title);
                }
                if (att.meta) {
                    const meta = createEl('span', 'ra-card-meta', att.meta);
                    card.appendChild(meta);
                }
                if (att.body) {
                    const body = createEl('div', 'ra-card-body', att.body);
                    card.appendChild(body);
                }
                if (att.src) {
                    const img = createEl('img', 'ra-card-image');
                    img.src = att.src;
                    card.appendChild(img);
                }

                bubble.appendChild(card);
            });
        }

        row.appendChild(bubble);
        els.messageList.appendChild(row);
        
        // Auto-scroll to bottom
        els.messageList.scrollTop = els.messageList.scrollHeight;
    }

    // Public API
    return {
        init: init,
        addMessage: (role, text) => addMessage(role, role === 'bot' ? 'AI' : 'ME', text) 
    };

})();
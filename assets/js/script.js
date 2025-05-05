document.addEventListener('DOMContentLoaded', () => {
    const langSwitcher = document.querySelector('.lang-switcher');
    let currentTranslations = {};

    // --- DOM Elements for Content Toggle ---
    const mainContent = document.getElementById('main-content');
    const registrationFormSection = document.getElementById('registration-form');
    const showRegisterTriggers = document.querySelectorAll('#trigger-register-view, #show-register-btn-header'); // Select both triggers
    const backToMainBtn = document.getElementById('back-to-main-btn');
    const container = document.querySelector('.container'); // To scroll to top of container

    // --- Translation Functions (Keep as is) ---
    async function fetchTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Could not fetch translations:", error);
            return {};
        }
    }

    function applyTranslations(translations) {
        currentTranslations = translations;
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if(element.hasAttribute('placeholder')) {
                        element.placeholder = translations[key];
                    }
                } else if (element.tagName === 'META' && element.getAttribute('name') === 'description') {
                    element.content = translations[key];
                } else if (element.tagName === 'TITLE') {
                     document.title = translations[key];
                }
                 else {
                    element.innerHTML = translations[key];
                }
            } else {
                // console.warn(`Translation key "${key}" not found.`); // Optional warning
            }
        });

        const inactiveButtonNote = document.getElementById('inactive-note');
        if (inactiveButtonNote && translations['buttonInactiveNote']) {
             inactiveButtonNote.textContent = translations['buttonInactiveNote'];
        }
        // Add translation for Back button if needed in JSON:
        // if(backToMainBtn && translations['backButton']) {
        //     backToMainBtn.innerHTML = translations['backButton'];
        // }
        // Add translation for header register button if needed:
        // const showRegBtnHeader = document.getElementById('show-register-btn-header');
        // if(showRegBtnHeader && translations['registerNowNav']) {
        //     showRegBtnHeader.innerHTML = translations['registerNowNav'];
        // }
    }

    async function setLanguage(lang) {
        const translations = await fetchTranslations(lang);
        if (Object.keys(translations).length > 0) {
            applyTranslations(translations);
            localStorage.setItem('preferredLang', lang);
            langSwitcher.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            });
             document.documentElement.lang = lang;
        } else {
             console.error(`Failed to load translations for ${lang}.`);
        }
    }

    // --- Event Listeners ---

    // Language switcher clicks (Keep as is)
    if (langSwitcher) {
        langSwitcher.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                const selectedLang = event.target.getAttribute('data-lang');
                if (selectedLang && selectedLang !== localStorage.getItem('preferredLang')) {
                    setLanguage(selectedLang);
                }
            }
        });
    }

    // --- Content Toggle Logic ---

    // Function to show Registration Form
    function showRegistrationForm(event) {
        if(event) event.preventDefault(); // Prevent default anchor behavior if triggered by link
        if (mainContent) mainContent.style.display = 'none';
        if (registrationFormSection) registrationFormSection.style.display = 'block';
        // Scroll to the top of the container or form smoothly
        if (container) {
             // Scroll slightly above the container top for better view with potential browser UI
             window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
        }
    }

    // Function to show Main Content
    function showMainContent() {
        if (registrationFormSection) registrationFormSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
         // Scroll to the top of the container
         if (container) {
            window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
         }
    }

    // Add listeners to all triggers
    if (showRegisterTriggers.length > 0 && mainContent && registrationFormSection) {
        showRegisterTriggers.forEach(trigger => {
            trigger.addEventListener('click', showRegistrationForm);
        });
    }

    // Add listener for the back button
    if (backToMainBtn && mainContent && registrationFormSection) {
        backToMainBtn.addEventListener('click', showMainContent);
    }


    // --- Initial Load ---
    let initialLang = localStorage.getItem('preferredLang');
    if (!initialLang) {
        const browserLang = navigator.language.split('-')[0];
        initialLang = (browserLang === 'en') ? 'en' : 'id';
    }
    setLanguage(initialLang);

    // Ensure initial state is correct (though CSS handles this primarily)
    // showMainContent(); // Not strictly needed if CSS default is correct

}); // End DOMContentLoaded

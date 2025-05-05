document.addEventListener('DOMContentLoaded', () => {
    const langSwitcher = document.querySelector('.lang-switcher');
    let currentTranslations = {};

    // --- DOM Elements for Content Toggle ---
    const mainContent = document.getElementById('main-content');
    const registrationFormSection = document.getElementById('registration-form');
    const showRegisterTriggers = document.querySelectorAll('#trigger-register-view, #show-register-btn-header, #show-register-btn-footer');
    const backToMainBtn = document.getElementById('back-to-main-btn');
    const container = document.querySelector('.container'); // To scroll to top of container

    // --- Translation Functions ---
    async function fetchTranslations(lang) {
        try {
            // DEBUG: Log the path being fetched
            console.log(`Fetching translations from: lang/${lang}.json`);
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for lang/${lang}.json`);
            }
            return await response.json();
        } catch (error) {
            console.error("Could not fetch translations:", error);
            // Provide user feedback in case of fetch error
            // alert(`Error loading language file for '${lang}'. Please check the console for details.`);
            return {}; // Return empty object on error
        }
    }

    function applyTranslations(translations) {
        console.log('Applying translations...'); // DEBUG
        currentTranslations = translations;
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key] !== undefined) { // Check if key exists
                // Handle different element types
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if(element.hasAttribute('placeholder')) {
                        element.placeholder = translations[key];
                    }
                    // Could also update 'value' if needed, but usually placeholder is sufficient
                } else if (element.tagName === 'META' && element.getAttribute('name') === 'description') {
                    element.content = translations[key];
                } else if (element.tagName === 'TITLE') {
                     document.title = translations[key]; // Update page title
                }
                 else {
                    // Use innerHTML carefully, assumes translation keys don't contain malicious script
                    element.innerHTML = translations[key];
                }
            } else {
                 console.warn(`Translation key "${key}" not found in loaded language file.`); // Optional warning
            }
        });

        // Explicitly update elements not using data-translate if necessary
        const inactiveButtonNote = document.getElementById('inactive-note');
        if (inactiveButtonNote && translations['buttonInactiveNote']) {
             inactiveButtonNote.textContent = translations['buttonInactiveNote'];
        }
    }

    async function setLanguage(lang) {
        console.log('Setting language to:', lang); // DEBUG
        const translations = await fetchTranslations(lang);
        // Check if fetch was successful and returned data
        if (translations && Object.keys(translations).length > 0) {
            console.log('Translations fetched successfully for', lang); // DEBUG
            applyTranslations(translations);
            localStorage.setItem('preferredLang', lang); // Save preference

            // Update active button style
            langSwitcher.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            });

             // Update html lang attribute for accessibility/SEO
             document.documentElement.lang = lang;

        } else {
             console.error(`Failed to load or apply translations for ${lang}. Check previous errors.`);
             // Maybe show an error message to the user
        }
    }

    // --- Event Listeners ---

    // Language switcher clicks
    if (langSwitcher) {
        langSwitcher.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                const selectedLang = event.target.getAttribute('data-lang');
                console.log('Language button clicked:', selectedLang); // DEBUG
                // Check if the language is actually different before reloading
                const currentLang = localStorage.getItem('preferredLang') || ((navigator.language.split('-')[0] === 'en') ? 'en' : 'id'); // Get current effective lang
                if (selectedLang && selectedLang !== currentLang) {
                    setLanguage(selectedLang);
                } else {
                    console.log('Language already active or invalid.'); // DEBUG
                }
            }
        });
    } else {
        console.error("Language switcher element not found!"); // DEBUG
    }

    // --- Content Toggle Logic ---
    function showRegistrationForm(event) {
        if(event) event.preventDefault(); // Prevent default link behavior
        console.log("Showing registration form..."); // DEBUG
        if (mainContent) mainContent.style.display = 'none';
        if (registrationFormSection) registrationFormSection.style.display = 'block';
        if (container) {
             // Scroll slightly above the container top
             window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth'}); // Fallback scroll to top
        }
    }

    function showMainContent() {
        console.log("Showing main content..."); // DEBUG
        if (registrationFormSection) registrationFormSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
         if (container) {
            window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
         } else {
             window.scrollTo({ top: 0, behavior: 'smooth'});
         }
    }

    // Add listeners to all triggers
    if (showRegisterTriggers.length > 0 && mainContent && registrationFormSection) {
        showRegisterTriggers.forEach(trigger => {
            trigger.addEventListener('click', showRegistrationForm);
        });
    } else {
         console.error("Could not find all elements needed for content toggle (triggers, mainContent, registrationForm)."); // DEBUG
    }

    // Add listener for the back button
    if (backToMainBtn && mainContent && registrationFormSection) {
        backToMainBtn.addEventListener('click', showMainContent);
    } else {
         console.error("Could not find back button or content elements."); // DEBUG
    }

    // --- Initial Load ---
    let initialLang = localStorage.getItem('preferredLang');
    if (!initialLang) {
        const browserLang = navigator.language ? navigator.language.split('-')[0] : 'id'; // Safer check
        initialLang = (browserLang === 'en') ? 'en' : 'id'; // Default to Indonesian
        console.log('No preferred language found, defaulting based on browser/default:', initialLang); // DEBUG
    } else {
        console.log('Found preferred language in localStorage:', initialLang); // DEBUG
    }

    // Load initial translations
    setLanguage(initialLang);

    // Ensure initial view is correct (redundant if CSS is correct, but safe)
    if (mainContent) mainContent.style.display = 'block';
    if (registrationFormSection) registrationFormSection.style.display = 'none';

}); // End DOMContentLoaded

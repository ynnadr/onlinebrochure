document.addEventListener('DOMContentLoaded', () => {
    const langSwitcher = document.querySelector('.lang-switcher');
    let currentTranslations = {};

    // --- Translation Functions ---

    // Fetches the translation file
    async function fetchTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Could not fetch translations:", error);
            // Fallback or default language logic could go here
            return {}; // Return empty object on error
        }
    }

    // Applies the loaded translations to the page
    function applyTranslations(translations) {
        currentTranslations = translations; // Store for potential reuse
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                // Handle different element types
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if(element.hasAttribute('placeholder')) {
                        element.placeholder = translations[key];
                    }
                } else if (element.tagName === 'META' && element.getAttribute('name') === 'description') {
                    element.content = translations[key];
                } else if (element.tagName === 'TITLE') {
                     document.title = translations[key]; // Update page title
                }
                 else {
                    // Use innerHTML for keys that contain HTML tags (like strong, br)
                     // Be cautious with innerHTML if translations come from untrusted sources
                    element.innerHTML = translations[key];
                }
            } else {
                console.warn(`Translation key "${key}" not found.`);
            }
        });

        // Update elements without data-translate if needed (e.g. static text in JS)
         const inactiveButtonNote = document.getElementById('inactive-note');
         if (inactiveButtonNote && translations['buttonInactiveNote']) {
             inactiveButtonNote.textContent = translations['buttonInactiveNote'];
         }
    }

    // Sets the language, loads translations, and updates UI
    async function setLanguage(lang) {
        const translations = await fetchTranslations(lang);
        if (Object.keys(translations).length > 0) {
            applyTranslations(translations);
            localStorage.setItem('preferredLang', lang); // Save preference

            // Update active button style
            langSwitcher.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            });

             // Update html lang attribute for accessibility/SEO
             document.documentElement.lang = lang;

        } else {
             console.error(`Failed to load translations for ${lang}.`);
             // Maybe show an error message to the user
        }

    }

    // --- Event Listeners ---

    // Language switcher clicks
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

    // --- Initial Load ---

    // Determine initial language: 1st localStorage, 2nd browser pref (simple check), 3rd default 'id'
    let initialLang = localStorage.getItem('preferredLang');
    if (!initialLang) {
        // Basic browser language check (might need refinement for variants like en-US)
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'en') {
             initialLang = 'en';
        } else {
             initialLang = 'id'; // Default to Indonesian
        }
    }


    // Load initial translations
    setLanguage(initialLang);

}); // End DOMContentLoaded

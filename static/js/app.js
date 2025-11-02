// ============= MAIN APPLICATION SCRIPT =============
// app.js - Global functionality, course recommendations, and utilities

// ============= COURSE DATABASE =============
const COURSES_DATABASE = {
    'python': [
        {
            id: 1,
            name: 'The Complete Python Bootcamp',
            platform: 'Udemy',
            instructor: 'José Portilla',
            price: 499,
            originalPrice: 3499,
            rating: 4.6,
            reviews: 2100000,
            duration: '22 hours',
            students: '1.5M+',
            description: 'Learn Python from zero to hero',
            certificate: true,
            skillLevel: 'Beginner to Advanced',
            url: 'https://www.udemy.com/course/complete-python-bootcamp/'
        },
        {
            id: 2,
            name: 'Python for Data Analysis',
            platform: 'Coursera',
            instructor: 'Google',
            price: 2999,
            originalPrice: 0,
            rating: 4.7,
            reviews: 450000,
            duration: '6 months',
            students: '500K+',
            description: 'Industry-recognized Python data skills',
            certificate: true,
            skillLevel: 'Intermediate',
            url: 'https://www.coursera.org/learn/python-data-analysis'
        },
        {
            id: 3,
            name: 'Python Programming Masterclass',
            platform: 'Udemy',
            instructor: 'Tim Buchalka',
            price: 549,
            originalPrice: 3499,
            rating: 4.5,
            reviews: 850000,
            duration: '40 hours',
            students: '1.2M+',
            description: 'Complete Python programming guide',
            certificate: true,
            skillLevel: 'Beginner to Intermediate',
            url: 'https://www.udemy.com/course/python-programming-masterclass/'
        },
        {
            id: 4,
            name: 'Python Basics',
            platform: 'edX',
            instructor: 'Microsoft',
            price: 1299,
            originalPrice: 1299,
            rating: 4.8,
            reviews: 200000,
            duration: '8 weeks',
            students: '300K+',
            description: 'Fundamentals of Python programming',
            certificate: true,
            skillLevel: 'Beginner',
            url: 'https://www.edx.org/course/python-basics'
        }
    ],
    'machine learning': [
        {
            id: 5,
            name: 'Machine Learning A-Z',
            platform: 'Udemy',
            instructor: 'Kirill Eremenko & Hadelin de Ponteves',
            price: 549,
            originalPrice: 3499,
            rating: 4.5,
            reviews: 650000,
            duration: '44 hours',
            students: '900K+',
            description: 'Complete machine learning and data science',
            certificate: true,
            skillLevel: 'Intermediate to Advanced',
            url: 'https://www.udemy.com/course/machinelearning/'
        },
        {
            id: 6,
            name: 'Machine Learning Specialization',
            platform: 'Coursera',
            instructor: 'Andrew Ng (DeepLearning.AI)',
            price: 3999,
            originalPrice: 0,
            rating: 4.9,
            reviews: 500000,
            duration: '3 months',
            students: '1M+',
            description: 'Supervised and unsupervised learning',
            certificate: true,
            skillLevel: 'Intermediate to Advanced',
            url: 'https://www.coursera.org/learn/machine-learning'
        },
        {
            id: 7,
            name: 'ML Crash Course',
            platform: 'Google',
            instructor: 'Google AI Experts',
            price: 0,
            originalPrice: 0,
            rating: 4.7,
            reviews: 300000,
            duration: '15 hours',
            students: '2M+',
            description: 'Quick introduction to ML with TensorFlow',
            certificate: false,
            skillLevel: 'Beginner',
            url: 'https://developers.google.com/machine-learning/crash-course'
        }
    ],
    'tensorflow': [
        {
            id: 8,
            name: 'TensorFlow Developer Certificate',
            platform: 'Coursera',
            instructor: 'Deeplearning.AI',
            price: 3999,
            originalPrice: 0,
            rating: 4.6,
            reviews: 200000,
            duration: '3 months',
            students: '400K+',
            description: 'Build and train deep learning models',
            certificate: true,
            skillLevel: 'Intermediate to Advanced',
            url: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice'
        },
        {
            id: 9,
            name: 'Complete Guide to TensorFlow',
            platform: 'Udemy',
            instructor: 'Jose Portilla & Pierian Data',
            price: 499,
            originalPrice: 3499,
            rating: 4.4,
            reviews: 150000,
            duration: '38 hours',
            students: '250K+',
            description: 'Deep learning with TensorFlow & Keras',
            certificate: true,
            skillLevel: 'Intermediate',
            url: 'https://www.udemy.com/course/complete-guide-to-tensorflow/'
        }
    ],
    'deep learning': [
        {
            id: 10,
            name: 'Deep Learning Specialization',
            platform: 'Coursera',
            instructor: 'Andrew Ng (DeepLearning.AI)',
            price: 3999,
            originalPrice: 0,
            rating: 4.8,
            reviews: 600000,
            duration: '4 months',
            students: '1.5M+',
            description: 'Neural networks, CNN, RNN & more',
            certificate: true,
            skillLevel: 'Intermediate to Advanced',
            url: 'https://www.coursera.org/specializations/deep-learning'
        },
        {
            id: 11,
            name: 'Fast.ai Deep Learning Course',
            platform: 'fast.ai',
            instructor: 'Jeremy Howard & Rachel Thomas',
            price: 0,
            originalPrice: 0,
            rating: 4.9,
            reviews: 150000,
            duration: '7 weeks',
            students: '500K+',
            description: 'Top-down approach to deep learning',
            certificate: false,
            skillLevel: 'Intermediate',
            url: 'https://course.fast.ai/'
        }
    ],
    'data analysis': [
        {
            id: 12,
            name: 'Data Analysis with Python',
            platform: 'Coursera',
            instructor: 'IBM',
            price: 2999,
            originalPrice: 0,
            rating: 4.6,
            reviews: 300000,
            duration: '3 months',
            students: '600K+',
            description: 'SQL, Pandas, NumPy, and visualization',
            certificate: true,
            skillLevel: 'Beginner to Intermediate',
            url: 'https://www.coursera.org/learn/data-analysis-with-python'
        },
        {
            id: 13,
            name: 'Python for Data Analysis',
            platform: 'Udemy',
            instructor: 'Wes McKinney',
            price: 399,
            originalPrice: 2999,
            rating: 4.7,
            reviews: 400000,
            duration: '20 hours',
            students: '800K+',
            description: 'DataFrames, plotting, and data cleaning',
            certificate: true,
            skillLevel: 'Beginner to Intermediate',
            url: 'https://www.udemy.com/course/python-for-data-analysis/'
        }
    ],
    'sql': [
        {
            id: 14,
            name: 'The Complete SQL Bootcamp',
            platform: 'Udemy',
            instructor: 'José Portilla',
            price: 449,
            originalPrice: 3499,
            rating: 4.6,
            reviews: 900000,
            duration: '9 hours',
            students: '1.5M+',
            description: 'SQL from beginner to advanced',
            certificate: true,
            skillLevel: 'Beginner to Advanced',
            url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/'
        }
    ],
    'statistics': [
        {
            id: 15,
            name: 'Statistics with Python',
            platform: 'Coursera',
            instructor: 'University of Michigan',
            price: 2999,
            originalPrice: 0,
            rating: 4.5,
            reviews: 250000,
            duration: '3 months',
            students: '400K+',
            description: 'Probability, inference, and regression',
            certificate: true,
            skillLevel: 'Beginner to Intermediate',
            url: 'https://www.coursera.org/learn/statistics-python'
        }
    ]
};

// ============= DOM UTILITIES =============

class DOMUtils {
    static show(element) {
        if (element) element.style.display = 'block';
    }

    static hide(element) {
        if (element) element.style.display = 'none';
    }

    static hasClass(element, className) {
        return element?.classList.contains(className);
    }

    static addClass(element, className) {
        element?.classList.add(className);
    }

    static removeClass(element, className) {
        element?.classList.remove(className);
    }

    static toggleClass(element, className) {
        element?.classList.toggle(className);
    }

    static setText(element, text) {
        if (element) element.textContent = text;
    }

    static setHTML(element, html) {
        if (element) element.innerHTML = html;
    }

    static on(element, event, callback) {
        element?.addEventListener(event, callback);
    }

    static off(element, event, callback) {
        element?.removeEventListener(event, callback);
    }
}

// ============= COURSE RECOMMENDATIONS ENGINE =============

class CourseRecommender {
    constructor() {
        this.database = COURSES_DATABASE;
    }

    // Get courses for missing skills
    getCoursesForSkills(skills) {
        const coursesMap = new Map();
        
        skills.forEach(skill => {
            const skillLower = skill.toLowerCase().trim();
            if (this.database[skillLower]) {
                const courses = this.database[skillLower];
                courses.forEach(course => {
                    if (!coursesMap.has(course.id)) {
                        coursesMap.set(course.id, course);
                    }
                });
            }
        });

        return Array.from(coursesMap.values());
    }

    // Sort courses by best value (rating * students / price)
    rankByValue(courses) {
        return courses.sort((a, b) => {
            const valueA = (a.rating * a.students.replace(/\D/g, '')) / (a.price || 1);
            const valueB = (b.rating * b.students.replace(/\D/g, '')) / (b.price || 1);
            return valueB - valueA;
        });
    }

    // Sort courses by rating
    sortByRating(courses) {
        return [...courses].sort((a, b) => b.rating - a.rating);
    }

    // Sort courses by price
    sortByPrice(courses) {
        return [...courses].sort((a, b) => a.price - b.price);
    }

    // Get top recommended course for a skill
    getTopCourse(skill) {
        const skillLower = skill.toLowerCase().trim();
        const courses = this.database[skillLower] || [];
        return this.rankByValue(courses)[0];
    }

    // Get all platform options
    getPlatforms(courses) {
        const platforms = new Map();
        courses.forEach(course => {
            if (!platforms.has(course.platform)) {
                platforms.set(course.platform, []);
            }
            platforms.get(course.platform).push(course);
        });
        return platforms;
    }

    // Calculate average price for skill
    getAveragePrice(skill) {
        const skillLower = skill.toLowerCase().trim();
        const courses = this.database[skillLower] || [];
        if (courses.length === 0) return 0;
        const total = courses.reduce((sum, c) => sum + c.price, 0);
        return Math.round(total / courses.length);
    }

    // Get price comparison analysis
    getPriceAnalysis(courses) {
        const prices = courses.map(c => c.price).filter(p => p > 0);
        if (prices.length === 0) return null;

        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            free: courses.filter(c => c.price === 0).length,
            paid: courses.filter(c => c.price > 0).length
        };
    }
}

// ============= COURSE CARD RENDERER =============

class CourseCardRenderer {
    static render(course) {
        const discount = course.originalPrice > 0 
            ? Math.round((1 - course.price / course.originalPrice) * 100)
            : 0;

        return `
            <div class="course-card card-modern" style="animation-delay: 0.1s;">
                <div class="course-header">
                    <div class="course-platform-badge">${course.platform}</div>
                    ${discount > 0 ? `<div class="course-discount-badge">-${discount}%</div>` : ''}
                </div>

                <h4 class="course-title">${course.name}</h4>
                <p class="course-instructor">
                    <i class="fas fa-user-tie"></i> ${course.instructor}
                </p>

                <div class="course-meta">
                    <span class="course-meta-item">
                        <i class="fas fa-star"></i> ${course.rating}
                        <span class="text-muted">(${this.formatNumber(course.reviews)})</span>
                    </span>
                    <span class="course-meta-item">
                        <i class="fas fa-clock"></i> ${course.duration}
                    </span>
                    <span class="course-meta-item">
                        <i class="fas fa-users"></i> ${course.students}
                    </span>
                </div>

                <p class="course-description">${course.description}</p>

                <div class="course-tags">
                    <span class="tag">${course.skillLevel}</span>
                    ${course.certificate ? '<span class="tag tag-certificate"><i class="fas fa-certificate"></i> Certificate</span>' : ''}
                </div>

                <div class="course-price-section">
                    <div class="course-pricing">
                        ${course.originalPrice > 0 ? `<span class="original-price">₹${course.originalPrice}</span>` : ''}
                        <span class="current-price">₹${course.price}</span>
                    </div>
                    <a href="${course.url}" target="_blank" class="btn-modern btn-primary-modern btn-sm">
                        <i class="fas fa-external-link-alt"></i> Enroll Now
                    </a>
                </div>
            </div>
        `;
    }

    static formatNumber(num) {
        if (typeof num === 'string') {
            num = parseInt(num.replace(/\D/g, ''));
        }
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
}

// ============= ANALYTICS TRACKER =============

class AnalyticsTracker {
    constructor() {
        this.events = [];
    }

    trackEvent(eventName, eventData) {
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            data: eventData
        };
        this.events.push(event);
        console.log('📊 Event tracked:', eventName, eventData);
    }

    trackSkillAnalysis(skills, domain, score) {
        this.trackEvent('skill_analysis', {
            skills: skills.length,
            domain: domain,
            score: score
        });
    }

    trackCourseView(courseId, courseName) {
        this.trackEvent('course_view', {
            courseId: courseId,
            courseName: courseName
        });
    }

    trackCourseClick(courseId, courseName, platform) {
        this.trackEvent('course_click', {
            courseId: courseId,
            courseName: courseName,
            platform: platform
        });
    }

    getReport() {
        return {
            totalEvents: this.events.length,
            events: this.events,
            summary: this.summarizeEvents()
        };
    }

    summarizeEvents() {
        const summary = {};
        this.events.forEach(event => {
            summary[event.name] = (summary[event.name] || 0) + 1;
        });
        return summary;
    }
}

// ============= NOTIFICATION SYSTEM =============

class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notification-container') || this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(type, title, message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} alert-modern`;
        notification.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: start;">
                <i class="fas fa-${this.getIcon(type)}" style="font-size: 1.2rem; margin-top: 2px;"></i>
                <div style="flex: 1;">
                    <strong>${title}</strong>
                    <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="border: none; background: none; cursor: pointer; font-size: 1.2rem;">×</button>
            </div>
        `;

        this.container.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => notification.remove(), duration);
        }

        return notification;
    }

    success(title, message) {
        return this.show('success', title, message);
    }

    error(title, message) {
        return this.show('danger', title, message);
    }

    warning(title, message) {
        return this.show('warning', title, message);
    }

    info(title, message) {
        return this.show('info', title, message);
    }

    getIcon(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// ============= FORM VALIDATOR =============

class FormValidator {
    static validate(formData, rules) {
        const errors = {};

        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const fieldRules = rules[field];

            if (fieldRules.required && !value) {
                errors[field] = `${field} is required`;
            }

            if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
                errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
            }

            if (fieldRules.email && value && !this.isValidEmail(value)) {
                errors[field] = 'Please enter a valid email';
            }

            if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
                errors[field] = fieldRules.message || `${field} format is invalid`;
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// ============= EXPORT FUNCTIONALITY =============

class ReportExporter {
    static generatePDF(analysisData) {
        console.log('📄 Generating PDF with data:', analysisData);
        // This would integrate with a PDF library like jsPDF
        this.showNotification('PDF generation coming soon!');
    }

    static generateCSV(courses) {
        let csv = 'Course Name,Platform,Price,Rating,Reviews,Duration,URL\n';
        
        courses.forEach(course => {
            csv += `"${course.name}","${course.platform}",${course.price},${course.rating},${course.reviews},"${course.duration}","${course.url}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'courses_comparison.csv';
        link.click();
    }

    static showNotification(message) {
        alert(message);
    }
}

// ============= GLOBAL INSTANCES =============

const recommender = new CourseRecommender();
const analytics = new AnalyticsTracker();
const notificationSystem = new NotificationSystem();

// ============= INITIALIZATION =============

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Application initialized');
    initializeApp();
});

function initializeApp() {
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Initialize tooltips and popovers if using Bootstrap
    if (window.bootstrap) {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new window.bootstrap.Tooltip(el);
        });
    }
}

// ============= HELPER FUNCTIONS =============

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CourseRecommender,
        AnalyticsTracker,
        NotificationSystem,
        FormValidator,
        ReportExporter,
        DOMUtils
    };
}

// ============= ADVANCED VISUALIZATION ENGINE =============
// charts.js - Power ful data visualization for CareerCompass

class ChartRenderer {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#4361ee',
            secondary: '#3a0ca3',
            success: '#4bb543',
            warning: '#ffc107',
            danger: '#dc3545',
            light: '#f0f4ff'
        };
    }

    // ============= SKILL GAP ANALYSIS CHART =============
    renderSkillGapChart(containerId, matchedSkills, missingSkills) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        const data = {
            labels: ['Current Skills', 'Missing Skills'],
            datasets: [{
                data: [matchedSkills.length, missingSkills.length],
                backgroundColor: [
                    'rgba(75, 181, 67, 0.8)',
                    'rgba(255, 193, 7, 0.8)'
                ],
                borderColor: [
                    'rgb(75, 181, 67)',
                    'rgb(255, 193, 7)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        };

        return new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 14, weight: '600' },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' skills';
                            }
                        }
                    }
                }
            }
        });
    }

    // =

// profile.js
window.onload = async function() {
    try {
        // Load user profile data
        const profileApiUrl = window.API_CONFIG ? window.API_CONFIG.PROFILE : 'http://localhost:3000/api/profile';
        const profileRes = await fetch(profileApiUrl, {
            credentials: 'include'
        });
        const profileResult = await profileRes.json();
        
        if (profileResult.success && profileResult.user) {
            const user = profileResult.user;
            document.getElementById('profile-name').textContent = user.fullName || '';
            document.getElementById('profile-username').textContent = user.username || '';
            document.getElementById('profile-email').textContent = user.email || '';
            document.getElementById('profile-phone').textContent = user.phone || '';
            document.getElementById('profile-type').textContent = user.usertype || '';
            document.getElementById('profile-location').textContent = user.location || '';
            document.getElementById('profile-careergoal').textContent = user.careerGoal || '';
            document.getElementById('profile-technologies').textContent = (user.preferredTechnologies || []).join(', ');
            
            // Load scores
            await loadResumeScore();
            await loadPracticeScore();
            await loadMockInterviewScore();
        } else {
            document.querySelector('.profile-container').innerHTML = '<p>User data not found. Please login again.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.profile-container').innerHTML = '<p>Error fetching user data. Please login again.</p>';
    }
};

async function loadResumeScore() {
    try {
        const scoreApiUrl = window.API_CONFIG ? window.API_CONFIG.RESUME_SCORE : 'http://localhost:3000/api/resume-score';
        const res = await fetch(scoreApiUrl, { 
            credentials: 'include' 
        });
        
        if (!res.ok) throw new Error('Failed to fetch resume scores');
        
        const data = await res.json();
        const scores = Array.isArray(data && data.scores) ? data.scores : [];
        const scoreElement = document.getElementById('resume-score');
        const scoreMessage = document.getElementById('score-message');
        const historyEl = document.getElementById('resume-score-history');
        const historySection = document.getElementById('resume-history');
        
        console.log('Resume scores loaded:', scores.length, 'scores');
        console.log('Resume scores data:', scores);
        
        if (scores.length > 0) {
            // Sort by timestamp descending and get the latest score
            scores.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const latestScore = scores[0];
            
            // Update the score display
            if (scoreElement) {
                const score = parseInt(latestScore.score, 10) || 0;
                scoreElement.textContent = score;
                
                if (scoreMessage) {
                    const timestamp = latestScore.timestamp ? new Date(latestScore.timestamp).toLocaleDateString() : '';
                    const fileName = latestScore.fileName ? latestScore.fileName : '';
                    let message = '';
                    if (score >= 90) message = 'Excellent resume!';
                    else if (score >= 80) message = 'Great resume!';
                    else if (score >= 70) message = 'Good resume!';
                    else if (score >= 60) message = 'Needs some work.';
                    else message = 'Needs significant improvements.';
                    
                    scoreMessage.textContent = `${message}${timestamp ? ' • ' + timestamp : ''}${fileName ? ' • ' + fileName : ''}`;
                }
            }
            
            // Show history if there are scores
            if (historyEl && historySection && scores.length > 0) {
                historyEl.innerHTML = '';
                scores.slice(0, 5).forEach((entry) => {
                    const li = document.createElement('li');
                    const ts = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'Recent';
                    const score = typeof entry.score === 'number' ? Math.round(entry.score) : '0';
                    const fileName = entry.fileName ? entry.fileName : 'Resume';
                    li.innerHTML = `<span>${ts} • ${fileName}</span><span><strong>${score}/100</strong></span>`;
                    historyEl.appendChild(li);
                });
                historySection.style.display = 'block';
            }
        } else {
            // No scores found
            if (scoreElement) scoreElement.textContent = '-';
            if (scoreMessage) scoreMessage.textContent = 'Upload your resume to get started';
            if (historyEl) historyEl.innerHTML = '';
            if (historySection) historySection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading resume score:', error);
        const scoreMessage = document.getElementById('score-message');
        if (scoreMessage) scoreMessage.textContent = 'Error loading resume score';
    }
}

async function loadPracticeScore() {
    try {
        const apiBase = window.API_CONFIG ? window.API_CONFIG.BASE_URL : 'http://localhost:3000';
        const practiceUrl = `${apiBase}/api/smart-practice-scores`;
        const res = await fetch(practiceUrl, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch practice scores');
        const data = await res.json();
        const scores = Array.isArray(data && data.scores) ? data.scores : [];
        const scoreValueEl = document.getElementById('practice-score-value');
        const metaEl = document.getElementById('practice-score-meta');
        const circle = document.getElementById('practice-score-circle');
        const historyEl = document.getElementById('practice-score-history');
        const historySection = document.getElementById('practice-history');
        const stageWrapper = document.getElementById('practice-stage-wrapper');

        if (scores.length === 0) {
            if (scoreValueEl) scoreValueEl.textContent = '--%';
            if (metaEl) metaEl.textContent = 'Complete a Smart Practice session to see your analytics.';
            if (historyEl) historyEl.innerHTML = '';
            if (historySection) historySection.style.display = 'none';
            if (stageWrapper) stageWrapper.style.display = 'none';
            return;
        }

        scores.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const latest = scores[0];
        const percent = calcPercentage(latest);
        if (scoreValueEl) scoreValueEl.textContent = `${percent}%`;
        applyScoreGradient(circle, percent, true);

        if (metaEl) {
            const timestamp = latest.timestamp ? new Date(latest.timestamp).toLocaleDateString() : '';
            const correct = typeof latest.correctAnswers === 'number' ? latest.correctAnswers : 0;
            const total = typeof latest.totalQuestions === 'number' ? latest.totalQuestions : 0;
            let message = '';
            if (percent >= 80) message = 'Excellent work!';
            else if (percent >= 60) message = 'Good job!';
            else message = 'Keep practicing!';
            
            metaEl.textContent = `${message}${timestamp ? ' • ' + timestamp : ''}${total ? ' • ' + correct + '/' + total + ' correct' : ''}`;
        }

        if (Array.isArray(latest.stageBreakdown) && latest.stageBreakdown.length > 0 && stageWrapper) {
            renderStageBreakdown(stageWrapper, latest.stageBreakdown);
        } else if (stageWrapper) {
            stageWrapper.style.display = 'none';
            stageWrapper.innerHTML = '';
        }

        if (historyEl) {
            historyEl.innerHTML = '';
            scores.slice(0, 5).forEach((entry) => {
                const li = document.createElement('li');
                const ts = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'Recent';
                const pct = calcPercentage(entry);
                const correct = typeof entry.correctAnswers === 'number' ? entry.correctAnswers : 0;
                const total = typeof entry.totalQuestions === 'number' ? entry.totalQuestions : 0;
                li.innerHTML = `<span>${ts}</span><span><strong>${pct}%</strong> (${correct}/${total})</span>`;
                historyEl.appendChild(li);
            });
            if (historySection) historySection.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading practice score:', error);
        const metaEl = document.getElementById('practice-score-meta');
        if (metaEl) metaEl.textContent = 'Error loading practice score.';
    }
}

function calcPercentage(entry) {
    if (!entry) return 0;
    if (typeof entry.percentage === 'number') return Math.round(entry.percentage);
    const correct = typeof entry.correctAnswers === 'number' ? entry.correctAnswers : 0;
    const total = typeof entry.totalQuestions === 'number' ? entry.totalQuestions : 0;
    if (!total) return 0;
    return Math.round((correct / total) * 100);
}

function applyScoreGradient(circleEl, score, isPractice = false) {
    if (!circleEl) return;
    const gradients = isPractice
        ? {
            high: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            mid: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            low: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            fail: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        }
        : {
            high: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            mid: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            low: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            fail: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        };
    let background = gradients.fail;
    if (score >= 80) background = gradients.high;
    else if (score >= 60) background = gradients.mid;
    else if (score >= 40) background = gradients.low;
    circleEl.style.background = background;
}

async function loadMockInterviewScore() {
    try {
        const apiBase = window.API_CONFIG ? window.API_CONFIG.BASE_URL : 'http://localhost:3000';
        const mockUrl = `${apiBase}/api/mock-interview-scores`;
        const res = await fetch(mockUrl, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch mock interview scores');
        const data = await res.json();
        const scores = Array.isArray(data && data.scores) ? data.scores : [];
        const scoreValueEl = document.getElementById('mock-score-value');
        const metaEl = document.getElementById('mock-score-meta');
        const historyEl = document.getElementById('mock-score-history');
        const historySection = document.getElementById('mock-history');
        
        console.log('Mock interview scores loaded:', scores.length, 'scores');
        console.log('Mock interview scores data:', scores);

        if (scores.length === 0) {
            if (scoreValueEl) scoreValueEl.textContent = '--/100';
            if (metaEl) metaEl.textContent = 'Complete a Mock Interview session to see your analytics.';
            if (historyEl) historyEl.innerHTML = '';
            if (historySection) historySection.style.display = 'none';
            return;
        }

        scores.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const latest = scores[0];
        const scoreValue = typeof latest.score === 'number' ? latest.score : 0;
        if (scoreValueEl) scoreValueEl.textContent = `${Math.round(scoreValue)}/100`;

        if (metaEl) {
            const timestamp = latest.timestamp ? new Date(latest.timestamp).toLocaleDateString() : '';
            const jobTitle = latest.jobTitle ? latest.jobTitle : '';
            let message = '';
            if (scoreValue >= 85) message = 'Outstanding performance!';
            else if (scoreValue >= 70) message = 'Great interview!';
            else if (scoreValue >= 60) message = 'Good effort!';
            else message = 'Keep practicing!';
            
            metaEl.textContent = `${message}${timestamp ? ' • ' + timestamp : ''}${jobTitle ? ' • ' + jobTitle : ''}`;
        }

        // Show history if there are scores (changed from > 1 to > 0)
        if (historyEl && historySection && scores.length > 0) {
            historyEl.innerHTML = '';
            scores.slice(0, 5).forEach((entry) => {
                const li = document.createElement('li');
                const ts = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'Recent';
                const score = typeof entry.score === 'number' ? Math.round(entry.score) : '0';
                const job = entry.jobTitle ? entry.jobTitle : 'Interview';
                li.innerHTML = `<span>${ts} • ${job}</span><span><strong>${score}/100</strong></span>`;
                historyEl.appendChild(li);
            });
            historySection.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading mock interview score:', error);
        const metaEl = document.getElementById('mock-score-meta');
        if (metaEl) metaEl.textContent = 'Error loading mock interview score.';
    }
}

function renderStageBreakdown(container, breakdown) {
    if (!container) return;
    container.innerHTML = '';
    if (!Array.isArray(breakdown) || breakdown.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    breakdown.forEach((stage) => {
        const pct = Math.max(0, Math.min(100, Math.round(Number(stage && stage.percentage) || 0)));
        const correct = typeof stage?.correct === 'number' ? stage.correct : 0;
        const total = typeof stage?.total === 'number' ? stage.total : 0;
        const row = document.createElement('div');
        row.className = 'stage-row';

        const header = document.createElement('div');
        header.className = 'stage-row__header';
        const titleSpan = document.createElement('span');
        titleSpan.textContent = stage && stage.title ? stage.title : 'Stage';
        const valueSpan = document.createElement('span');
        valueSpan.textContent = `${correct}/${total} (${pct}%)`;
        header.appendChild(titleSpan);
        header.appendChild(valueSpan);

        const bar = document.createElement('div');
        bar.className = 'stage-row__bar';
        const fill = document.createElement('div');
        fill.className = 'stage-row__bar-fill';
        fill.style.width = `${pct}%`;
        bar.appendChild(fill);

        row.appendChild(header);
        row.appendChild(bar);
        container.appendChild(row);
    });
}

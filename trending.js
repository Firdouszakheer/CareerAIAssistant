/* public/js/trending.js — Static trending career data & renderer */

const TRENDING_CAREERS = [
  {
    tag: 'Technology',
    title: 'Software Engineer',
    desc: 'Design, develop, and maintain software systems and applications at scale.',
    salary: '$95,000 – $160,000',
    growth: '25%',
    skills: ['Python', 'JavaScript', 'System Design'],
  },
  {
    tag: 'Technology',
    title: 'Data Scientist',
    desc: 'Analyze complex datasets to help organizations make smarter, faster decisions.',
    salary: '$100,000 – $155,000',
    growth: '36%',
    skills: ['Python', 'Machine Learning', 'Statistics'],
  },
  {
    tag: 'Design',
    title: 'UX Designer',
    desc: 'Create intuitive and engaging user experiences for digital products and apps.',
    salary: '$75,000 – $130,000',
    growth: '13%',
    skills: ['Figma', 'User Research', 'Prototyping'],
  },
  {
    tag: 'Healthcare',
    title: 'Registered Nurse',
    desc: 'Provide direct patient care in hospitals, clinics, and community health settings.',
    salary: '$65,000 – $100,000',
    growth: '6%',
    skills: ['Patient Care', 'Clinical Skills', 'Communication'],
  },
  {
    tag: 'Finance',
    title: 'Financial Analyst',
    desc: 'Evaluate financial data and market trends to guide investment and business decisions.',
    salary: '$70,000 – $120,000',
    growth: '9%',
    skills: ['Excel', 'Financial Modeling', 'CFA'],
  },
  {
    tag: 'Business',
    title: 'Product Manager',
    desc: 'Bridge engineering, design, and business to ship products users love.',
    salary: '$110,000 – $170,000',
    growth: '19%',
    skills: ['Strategy', 'Agile', 'Data Analysis'],
  },
  {
    tag: 'Science',
    title: 'Biomedical Researcher',
    desc: 'Conduct research to advance medicine, develop treatments, and improve human health.',
    salary: '$60,000 – $110,000',
    growth: '11%',
    skills: ['Lab Techniques', 'Research Methods', 'Data Analysis'],
  },
  {
    tag: 'Education',
    title: 'Instructional Designer',
    desc: 'Design effective learning experiences, courses, and training programs.',
    salary: '$55,000 – $90,000',
    growth: '8%',
    skills: ['Curriculum Design', 'E-Learning Tools', 'Communication'],
  },
  {
    tag: 'Technology',
    title: 'Cybersecurity Analyst',
    desc: 'Protect systems and data by monitoring threats and implementing security protocols.',
    salary: '$85,000 – $145,000',
    growth: '32%',
    skills: ['Network Security', 'Ethical Hacking', 'Risk Analysis'],
  },
];

function renderTrending() {
  const grid = document.getElementById('trending-grid');
  if (!grid) return;

  grid.innerHTML = TRENDING_CAREERS.map(c => `
    <div class="career-card" onclick="prefillCareer('${escAttr(c.title)}')">
      <span class="card-tag">${c.tag}</span>
      <div class="card-title">${c.title}</div>
      <p class="card-desc">${c.desc}</p>
      <div class="card-meta">
        <div class="card-meta-item">
          <span class="card-meta-lbl">Avg. Salary</span>
          <span class="card-meta-val">${c.salary}</span>
        </div>
        <div class="card-meta-item" style="text-align:right">
          <span class="card-meta-lbl">Growth</span>
          <span class="card-meta-val green">↑ ${c.growth}</span>
        </div>
      </div>
      <div class="card-chips">${c.skills.map(s => `<span class="chip">${s}</span>`).join('')}</div>
    </div>
  `).join('');
}

function escAttr(s) {
  return s.replace(/'/g, "\\'");
}

function prefillCareer(title) {
  const input = document.getElementById('interest');
  if (!input) return;
  input.value = title;
  input.focus();
  // Scroll to form on mobile
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Trigger smart search for related fields
  if (typeof onInterestChange === 'function') onInterestChange(title);
}

// Init
document.addEventListener('DOMContentLoaded', renderTrending);

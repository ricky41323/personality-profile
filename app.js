// ============================================================
// App Logic - Personality Profile Generator (v2)
// Multi-Enneagram (Top 3 + Bottom 3) + Friendship Tips
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profileForm');
  const nameInput = document.getElementById('nameInput');
  const mbtiInput = document.getElementById('mbtiInput');
  const enneaInput = document.getElementById('enneaInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const inputSection = document.getElementById('inputSection');
  const resultsSection = document.getElementById('resultsSection');
  const validationMsg = document.getElementById('validationMsg');

  function parseMBTI(val) {
    if(!val) return null;
    const cleaned = val.replace(/\([^)]*\)/g, '').toUpperCase();
    const match = cleaned.match(/[IE][SN][TF][JP]/);
    return match ? match[0] : null;
  }

  function parseEnnea(val) {
    if(!val) return null;
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 3) {
      return [parseInt(digits[0]), parseInt(digits[1]), parseInt(digits[2])];
    }
    return null;
  }

  function validateForm() {
    const nameValid = nameInput.value.trim() !== '';
    const mbti = parseMBTI(mbtiInput.value);
    const ennea = parseEnnea(enneaInput.value);
    
    let errorMsg = '';
    if (mbtiInput.value.trim() !== '' && !mbti) {
      errorMsg = '⚠️ 올바른 MBTI 형식이 아닙니다. (예: ISFJ)';
    } else if (enneaInput.value.trim() !== '' && !ennea) {
      errorMsg = '⚠️ 에니어그램은 최소 3개의 숫자가 포함되어야 합니다. (예: 619)';
    } else if (ennea) {
      const unique = new Set(ennea);
      if (unique.size !== 3) {
        errorMsg = '⚠️ 에니어그램 상위 3유형은 서로 달라야 합니다.';
      }
    }

    validationMsg.textContent = errorMsg;
    const isValid = nameValid && !!mbti && !!ennea && errorMsg === '';
    analyzeBtn.disabled = !isValid;
    return isValid;
  }

  nameInput.addEventListener('input', validateForm);
  mbtiInput.addEventListener('input', validateForm);
  enneaInput.addEventListener('input', validateForm);

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const name = nameInput.value.trim();
    const mbtiType = parseMBTI(mbtiInput.value);
    const topTypes = parseEnnea(enneaInput.value);
    const bottomTypes = []; // Removed bottom types

    const coreEmotions = Array.from(document.querySelectorAll('input[name="coreEmotions"]:checked')).map(cb => parseInt(cb.value));
    const coreBeliefs = Array.from(document.querySelectorAll('input[name="coreBeliefs"]:checked')).map(cb => parseInt(cb.value));
    const defenseMechanisms = Array.from(document.querySelectorAll('input[name="defenseMechanisms"]:checked')).map(cb => parseInt(cb.value));

    generateProfile(name, mbtiType, topTypes, bottomTypes, coreEmotions, coreBeliefs, defenseMechanisms);
  });

  function generateProfile(name, mbtiType, topTypes, bottomTypes, coreEmotions, coreBeliefs, defenseMechanisms) {
    const mbti = MBTI_DATA[mbtiType];
    if (!mbti) return;

    const topEnneaData = topTypes.map(t => ({ type: t, data: ENNEAGRAM_DATA[t], ext: typeof ENNEAGRAM_EXTENDED !== 'undefined' ? ENNEAGRAM_EXTENDED[t] : null }));
    const bottomEnneaData = bottomTypes.map(t => ({ type: t, data: ENNEAGRAM_DATA[t], ext: typeof ENNEAGRAM_EXTENDED !== 'undefined' ? ENNEAGRAM_EXTENDED[t] : null }));

    let html = '';

    // ── Profile Header ──
    html += `
      <div class="profile-header animate-in">
        <h2 class="profile-header__name">${escapeHtml(name)}</h2>
        <div class="profile-header__badges">
          <span class="badge badge--mbti">${mbti.emoji} ${mbtiType} · ${mbti.name}</span>
          ${topEnneaData.map((e, i) => `
            <span class="badge badge--enneagram">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${e.type}유형 ${e.data.name}</span>
          `).join('')}
        </div>
      </div>
      <!-- Section: MBTI & Enneagram -->
      <div class="section-title">✨ 기본 성향 분석</div>
    `;

    // ── Enneagram: All Top 3 Type Cards ──
    html += `<div class="result-cards">`;
    topEnneaData.forEach((e, i) => {
      const rankLabel = i === 0 ? '1순위 (주 유형)' : i === 1 ? '2순위' : '3순위';
      const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
      html += `
        <div class="result-card result-card--enneagram ennea-${e.type} animate-in">
          <div class="result-card__header">
            <div class="result-card__icon">${e.data.emoji}</div>
            <div>
              <div class="result-card__title">${rankEmoji} 에니어그램 ${e.type}유형 (${rankLabel})</div>
              <div class="result-card__subtitle">${e.data.name}</div>
            </div>
          </div>

          <p class="result-card__description">${e.data.description}</p>

          <div class="trait-section">
            <div class="trait-section__title">핵심 욕구</div>
            <p class="result-card__description" style="margin-bottom:0">${e.data.coreDesire}</p>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">핵심 두려움</div>
            <p class="result-card__description" style="margin-bottom:0">${e.data.coreFear}</p>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">핵심 동기</div>
            <p class="result-card__description" style="margin-bottom:0">${e.data.coreMotivation}</p>
          </div>

          <div class="trait-section">
            <div class="trait-section__title">키워드</div>
            <div class="trait-tags">
              ${e.data.keywords.map(k => `<span class="trait-tag trait-tag--keyword">${k}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">강점</div>
            <div class="trait-tags">
              ${e.data.strengths.map(s => `<span class="trait-tag trait-tag--strength">${s}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">약점</div>
            <div class="trait-tags">
              ${e.data.weaknesses.map(w => `<span class="trait-tag trait-tag--weakness">${w}</span>`).join('')}
            </div>
          </div>

          <div class="trait-section">
            <div class="trait-section__title">성장 방향</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--growth">📈</span>
                <span>${e.data.growthDirection}</span>
              </li>
            </ul>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">스트레스 방향</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--stress">📉</span>
                <span>${e.data.stressDirection}</span>
              </li>
            </ul>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">소통 가이드</div>
            <ul class="detail-list">
              ${e.data.communicationTips.map(tip => `
                <li class="detail-list__item">
                  <span class="detail-list__icon detail-list__icon--tip">💡</span>
                  <span>${tip}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    });

    // ── MBTI Card ──
    html += `
        <div class="result-card result-card--mbti animate-in">
          <div class="result-card__header">
            <div class="result-card__icon">${mbti.emoji}</div>
            <div>
              <div class="result-card__title">${mbtiType}</div>
              <div class="result-card__subtitle">${mbti.name} · ${mbti.group}</div>
            </div>
          </div>

          <p class="result-card__description">${mbti.description}</p>

          <div class="trait-section">
            <div class="trait-section__title">인지 기능</div>
            <p class="result-card__description" style="margin-bottom:0">${mbti.functions}</p>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">키워드</div>
            <div class="trait-tags">
              ${mbti.keywords.map(k => `<span class="trait-tag trait-tag--keyword">${k}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">강점</div>
            <div class="trait-tags">
              ${mbti.strengths.map(s => `<span class="trait-tag trait-tag--strength">${s}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">약점</div>
            <div class="trait-tags">
              ${mbti.weaknesses.map(w => `<span class="trait-tag trait-tag--weakness">${w}</span>`).join('')}
            </div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">소통 스타일</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--tip">🗣️</span>
                <span>${mbti.communicationStyle}</span>
              </li>
            </ul>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">업무 스타일</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--tip">💼</span>
                <span>${mbti.workStyle}</span>
              </li>
            </ul>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">관계 스타일</div>
            <ul class="detail-list">
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--tip">❤️</span>
                <span>${mbti.relationshipStyle}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // ── 잘 맞는 성향 추천 ──
    const compat = typeof MBTI_COMPATIBILITY !== 'undefined' ? MBTI_COMPATIBILITY[mbtiType] : null;
    if (compat) {
      const matchBadges = compat.bestMatch.map(m => {
        const matchData = MBTI_DATA[m];
        return matchData ? `<span class="badge badge--mbti" style="background:var(--accent-emerald); color:#059669;">${matchData.emoji} ${m} · ${matchData.name}</span>` : `<span class="badge badge--mbti">${m}</span>`;
      }).join('');
      html += `
        <div class="synergy-card animate-in" style="margin-top:24px;">
          <div class="synergy-card__header">
            <div class="synergy-card__icon">💕</div>
            <div>
              <div class="synergy-card__title">잘 맞는 성향 추천</div>
              <div class="synergy-card__subtitle">${mbtiType}와 시너지가 좋은 유형</div>
            </div>
          </div>
          <div class="synergy-card__body">
            <div class="synergy-item">
              <div class="synergy-item__label">🏆 Best Match</div>
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">${matchBadges}</div>
              <div class="synergy-item__text">${compat.reason}</div>
            </div>
          </div>
        </div>
      `;
    }

    // ── Friendship Tips Card ──
    const friendshipTips = MBTI_FRIENDSHIP_TIPS[mbtiType];
    if (friendshipTips && friendshipTips.length > 0) {
      html += `
        <div class="friendship-card animate-in">
          <div class="friendship-card__header">
            <div class="friendship-card__icon">🤝</div>
            <div>
              <div class="friendship-card__title">${mbtiType} 유형과 친해지는 법</div>
              <div class="friendship-card__subtitle">${mbti.name}과 좋은 관계를 만들기 위한 팁</div>
            </div>
          </div>
          <ul class="detail-list">
            ${friendshipTips.map(tip => `
              <li class="detail-list__item">
                <span class="detail-list__icon detail-list__icon--friend">💬</span>
                <span>${tip}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // ── Core Emotions Section ──
    if (coreEmotions.length > 0) {
      html += `
        <div class="section-title" style="margin-top:40px;">❤️ 핵심 감정 분석</div>
        <div class="result-cards">`;
      coreEmotions.forEach(id => {
        const emo = typeof CORE_EMOTIONS_DATA !== 'undefined' ? CORE_EMOTIONS_DATA[id] : null;
        if (!emo) return;
        html += `
          <div class="result-card result-card--enneagram animate-in">
            <div class="result-card__header">
              <div class="result-card__icon">❤️</div>
              <div>
                <div class="result-card__title">${emo.name}</div>
                <div class="result-card__subtitle">"${emo.selfMessage}"</div>
              </div>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">이해 (발생 원인)</div>
              <p class="result-card__description">${emo.understand}</p>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">보여지는 이미지</div>
              <p class="result-card__description">${emo.image}</p>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">성장 및 방향 제시</div>
              <p class="result-card__description" style="color:var(--accent-emerald); font-weight:500;">${emo.direction}</p>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    // ── Core Beliefs Section ──
    if (coreBeliefs.length > 0) {
      html += `
        <div class="section-title" style="margin-top:40px;">🧠 비합리적 신념 분석</div>
        <div class="result-cards">`;
      coreBeliefs.forEach(id => {
        const bel = typeof CORE_BELIEFS_DATA !== 'undefined' ? CORE_BELIEFS_DATA[id] : null;
        if (!bel) return;
        html += `
          <div class="result-card result-card--mbti animate-in">
            <div class="result-card__header">
              <div class="result-card__icon">🧠</div>
              <div>
                <div class="result-card__title">${bel.name}</div>
                <div class="result-card__subtitle">${bel.def}</div>
              </div>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">비합리적 이유</div>
              <p class="result-card__description">${bel.reason}</p>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">합리적 논박 (해결책)</div>
              <p class="result-card__description" style="color:var(--accent-cyan); font-weight:500;">${bel.rebuttal}</p>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    // ── Defense Mechanisms Section ──
    if (defenseMechanisms.length > 0) {
      html += `
        <div class="section-title" style="margin-top:40px;">🛡️ 방어기제 분석</div>
        <div class="result-cards">`;
      defenseMechanisms.forEach(id => {
        const def = typeof DEFENSE_MECHANISMS_DATA !== 'undefined' ? DEFENSE_MECHANISMS_DATA[id] : null;
        if (!def) return;
        html += `
          <div class="result-card result-card--enneagram animate-in">
            <div class="result-card__header">
              <div class="result-card__icon">🛡️</div>
              <div>
                <div class="result-card__title">${def.name}</div>
                <div class="result-card__subtitle defense-group-title--${def.levelClass}">${def.level}</div>
              </div>
            </div>
            <p class="result-card__description">${def.def}</p>
            <div class="trait-section">
              <div class="trait-section__title">주요 예시</div>
              <ul class="detail-list">
                ${def.examples.map(ex => `
                  <li class="detail-list__item">
                    <span class="detail-list__icon detail-list__icon--tip">💡</span>
                    <span>${ex}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="trait-section">
              <div class="trait-section__title">상담 멘트</div>
              <p class="result-card__description" style="color:var(--accent-purple); font-weight:500;">${def.counsel}</p>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    // ══════════════════════════════════════════════════════════
    // All-in-One 종합 분석 (Dynamic Templating Algorithm)
    // ══════════════════════════════════════════════════════════
    html += `<div class="section-title" style="margin-top:48px;">📋 All-in-One 종합 분석</div>`;
    html += `<div class="synergy-card animate-in" style="margin-top:8px;">`;
    html += `<div class="synergy-card__header"><div class="synergy-card__icon">📋</div><div><div class="synergy-card__title">${escapeHtml(name)}님의 종합 성향 리포트</div><div class="synergy-card__subtitle">모든 검사 결과를 통합한 맞춤형 분석</div></div></div>`;
    html += `<div class="synergy-card__body">`;

    // ── 1. 정체성 정의 ──
    const mainEnnea = topEnneaData[0];
    const subEnnea1 = topEnneaData[1];
    const subEnnea2 = topEnneaData[2];
    html += `
      <div class="synergy-item">
        <div class="synergy-item__label">🧬 정체성 정의</div>
        <div class="synergy-item__text">
          <strong>${escapeHtml(name)}</strong>님은 <strong>${mbtiType}(${mbti.name})</strong>의 ${mbti.keywords.slice(0, 2).join(', ')} 특성과
          에니어그램 <strong>${mainEnnea.type}유형(${mainEnnea.data.name})</strong>의 핵심 동기인 "${mainEnnea.data.coreDesire}"가 결합된 성격 구조를 가지고 있습니다.
          여기에 ${subEnnea1.type}유형(${subEnnea1.data.name})의 "${subEnnea1.data.coreDesire}" 욕구와
          ${subEnnea2.type}유형(${subEnnea2.data.name})의 "${subEnnea2.data.coreDesire}" 욕구가 보조적으로 작용하여,
          <strong>${mbti.keywords[0]}</strong>과 <strong>${mainEnnea.data.keywords[0]}</strong>을 동시에 추구하는 독특한 내면 세계를 형성합니다.
        </div>
      </div>
    `;

    // ── 2. 강점과 행동 패턴 ──
    const combinedStrengths = [...new Set([...mbti.strengths.slice(0, 3), ...mainEnnea.data.strengths.slice(0, 2)])];
    html += `
      <div class="synergy-item">
        <div class="synergy-item__label">💪 강점과 행동 패턴</div>
        <div class="synergy-item__text">
          ${mbtiType}의 "${mbti.communicationStyle.split('.')[0]}" 특성이 ${mainEnnea.type}유형의 강점인 ${mainEnnea.data.strengths.slice(0, 3).join(', ')}과 결합되어,
          <strong>${combinedStrengths.join(', ')}</strong>에서 뛰어난 역량을 발휘합니다.
          특히 ${mbti.workStyle.split('.')[0]}며, 이는 에니어그램 ${mainEnnea.type}유형의 "${mainEnnea.data.coreMotivation.split('.')[0]}" 동기와 맞물려 더욱 강화됩니다.
        </div>
      </div>
    `;

    // ── 3. 내면의 갈등 메커니즘 (선택사항 연계) ──
    let conflictText = '';
    const hasOptionals = coreEmotions.length > 0 || coreBeliefs.length > 0 || defenseMechanisms.length > 0;

    // Base conflict from MBTI weaknesses + Enneagram core fear
    conflictText += `${escapeHtml(name)}님의 내면에는 "${mainEnnea.data.coreFear}"라는 근본적인 두려움이 자리잡고 있으며, 이는 ${mbtiType}의 약점인 ${mbti.weaknesses.slice(0, 2).join(', ')}과 맞물려 스트레스 상황에서 표면화될 수 있습니다.`;

    // Add core beliefs connection
    if (coreBeliefs.length > 0) {
      const beliefNames = coreBeliefs.map(id => {
        const b = typeof CORE_BELIEFS_DATA !== 'undefined' ? CORE_BELIEFS_DATA[id] : null;
        return b ? `"${b.def}"` : null;
      }).filter(Boolean);
      if (beliefNames.length > 0) {
        conflictText += ` 이러한 성향의 기저에는 ${beliefNames.join(', ')}이라는 비합리적 신념이 무의식적으로 작동하고 있습니다.`;
      }
    }

    // Add core emotions connection
    if (coreEmotions.length > 0) {
      const emotionNames = coreEmotions.map(id => {
        const e = typeof CORE_EMOTIONS_DATA !== 'undefined' ? CORE_EMOTIONS_DATA[id] : null;
        return e ? e.name : null;
      }).filter(Boolean);
      if (emotionNames.length > 0) {
        conflictText += ` 그 결과, 스트레스나 갈등 상황에서 <strong>${emotionNames.join(', ')}</strong>을(를) 주로 경험하게 됩니다.`;
      }
    }

    // Add defense mechanisms connection
    if (defenseMechanisms.length > 0) {
      const defNames = defenseMechanisms.map(id => {
        const d = typeof DEFENSE_MECHANISMS_DATA !== 'undefined' ? DEFENSE_MECHANISMS_DATA[id] : null;
        return d ? d.name : null;
      }).filter(Boolean);
      if (defNames.length > 0) {
        conflictText += ` 이때 자아를 보호하기 위해 <strong>${defNames.join(', ')}</strong> 등의 방어기제를 사용하게 되며, 이는 에니어그램 ${mainEnnea.type}유형의 스트레스 방향(${mainEnnea.data.stressDirection.split('—')[0].trim()})과 맞물려 나타날 수 있습니다.`;
      }
    }

    if (!hasOptionals) {
      conflictText += ` ${mainEnnea.data.stressDirection.includes('—') ? mainEnnea.data.stressDirection.split('—')[1].trim() : ''}`;
    }

    html += `
      <div class="synergy-item">
        <div class="synergy-item__label">⚡ 내면의 갈등 메커니즘</div>
        <div class="synergy-item__text">${conflictText}</div>
      </div>
    `;

    // ── 4. 맞춤형 솔루션 및 성장 방향 ──
    let solutionText = `${mainEnnea.type}유형의 성장 방향인 "${mainEnnea.data.growthDirection.split('—')[0].trim()}"을 기본 나침반으로 삼아, ${mainEnnea.data.growthDirection.split('—')[1] ? mainEnnea.data.growthDirection.split('—')[1].trim() : '성장의 방향으로 나아갈 수 있습니다.'}`;

    // Add belief-based solution
    if (coreBeliefs.length > 0) {
      const firstBelief = typeof CORE_BELIEFS_DATA !== 'undefined' ? CORE_BELIEFS_DATA[coreBeliefs[0]] : null;
      if (firstBelief) {
        solutionText += ` 또한, "${firstBelief.def}"라는 신념에 대해 "${firstBelief.rebuttal}"라는 합리적 사고로 전환하는 연습이 핵심적인 솔루션이 됩니다.`;
      }
    }

    // Add emotion-based growth
    if (coreEmotions.length > 0) {
      const firstEmotion = typeof CORE_EMOTIONS_DATA !== 'undefined' ? CORE_EMOTIONS_DATA[coreEmotions[0]] : null;
      if (firstEmotion && firstEmotion.direction) {
        solutionText += ` ${firstEmotion.name}에 대해서는 "${firstEmotion.direction}" 방식으로 접근하는 것이 효과적입니다.`;
      }
    }

    // Add MBTI-specific growth
    solutionText += ` ${mbtiType}의 관계 스타일("${mbti.relationshipStyle.split('.')[0]}")을 인식하고, 에니어그램 ${subEnnea1.type}유형과 ${subEnnea2.type}유형의 강점인 ${subEnnea1.data.strengths[0]}과 ${subEnnea2.data.strengths[0]}을 활용하면 더욱 균형 잡힌 성장이 가능합니다.`;

    html += `
      <div class="synergy-item">
        <div class="synergy-item__label">🌱 맞춤형 솔루션 및 성장 방향</div>
        <div class="synergy-item__text">${solutionText}</div>
      </div>
    `;

    html += `</div></div>`; // close synergy-card

    // ── Action Buttons ──
    html += `
      <div style="text-align: center; margin-top: 40px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <button class="btn-new" id="captureBtn" type="button" style="background: var(--gradient-primary); color: white; border: none; box-shadow: var(--shadow-sm);">
          <span>📸</span> 결과 캡쳐하기
        </button>
        <button class="btn-new" id="newAnalysisBtn" type="button">
          <span>↩️</span> 새로운 분석 시작
        </button>
      </div>
    `;

    // Render
    resultsSection.innerHTML = html;
    resultsSection.classList.add('active');
    inputSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // New analysis button handler
    document.getElementById('newAnalysisBtn').addEventListener('click', () => {
      resultsSection.classList.remove('active');
      resultsSection.innerHTML = '';
      inputSection.style.display = '';
      inputSection.style.animation = 'fadeInUp 0.5s ease';
      nameInput.focus();
    });

    // Capture button handler
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
      captureBtn.addEventListener('click', async () => {
        const originalText = captureBtn.innerHTML;
        captureBtn.innerHTML = '<span>⏳</span> 캡쳐 중...';
        captureBtn.disabled = true;

        // Hide buttons during capture
        const actionButtons = captureBtn.parentElement;
        actionButtons.style.display = 'none';

        try {
          const canvas = await html2canvas(resultsSection, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#f8fafc'
          });
          
          const filename = `${name}_성향분석결과.png`;
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          const file = new File([blob], filename, { type: 'image/png' });

          // Web Share API를 지원하면 네이티브 공유(갤러리 저장 등) 메뉴 호출
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: '대상자 종합 분석 결과'
              });
            } catch (err) {
              // 사용자가 취소한 경우는 무시, 에러일 경우 다운로드 폴백
              if (err.name !== 'AbortError') {
                fallbackDownload(canvas, filename);
              }
            }
          } else {
            // 지원하지 않으면 일반 다운로드
            fallbackDownload(canvas, filename);
          }
        } catch (err) {
          console.error('캡쳐 실패:', err);
          alert('결과 캡쳐에 실패했습니다.');
        } finally {
          // Restore buttons
          actionButtons.style.display = 'flex';
          captureBtn.innerHTML = originalText;
          captureBtn.disabled = false;
        }
      });
    }

    function fallbackDownload(canvas, filename) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }

  // Utility: escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});

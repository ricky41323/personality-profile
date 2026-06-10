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
            <div class="trait-section__title">어린시절 받는 메시지</div>
            <div style="background:#FFF1F2; color:#be123c; padding:12px; border-radius:8px; font-weight:600; margin-top:8px; line-height:1.5;">"${e.data.childhoodMessage}"</div>
          </div>
          <div class="trait-section">
            <div class="trait-section__title">형성 배경</div>
            <p class="result-card__description" style="margin-bottom:0">${e.data.background}</p>
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
              <div style="background:#E2F9F2; color:#059669; padding:12px; border-radius:8px; font-weight:600; margin-top:8px; line-height:1.5;">${emo.direction}</div>
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
              <div style="background:#E6FAFF; color:#0284c7; padding:12px; border-radius:8px; font-weight:600; margin-top:8px; line-height:1.5;">${bel.rebuttal}</div>
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
              <div style="background:#E8F3FF; color:var(--toss-blue); padding:12px; border-radius:8px; font-weight:600; margin-top:8px; line-height:1.5;">${def.counsel}</div>
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

    // ── 1. 핵심 동기와 정체성 ──
    const mainEnnea = topEnneaData[0];
    const subEnnea1 = topEnneaData[1];
    const subEnnea2 = topEnneaData[2];
    html += `
      <div class="synergy-item">
        <div class="synergy-item__label">🧬 핵심 동기와 정체성</div>
        <div class="synergy-item__text">
          <strong>${escapeHtml(name)}</strong>님은 <strong>${mbtiType}(${mbti.name})</strong>의 특징과
          에니어그램 <strong>${mainEnnea.type}유형(${mainEnnea.data.name})</strong>의 성향이 깊게 결합된 분입니다.<br><br>
          무엇보다 <strong>"${mainEnnea.data.coreDesire}"</strong>는 것을 삶의 가장 중요한 가치이자 목표로 삼고 있습니다. 
          이러한 주된 욕구 뒤에는 ${subEnnea1.type}유형의 "${subEnnea1.data.coreDesire}"와 ${subEnnea2.type}유형의 "${subEnnea2.data.coreDesire}"가 보조적으로 작용하고 있습니다. 
          결과적으로, 이 세 가지 욕구가 융합되어 <strong>"${mainEnnea.data.coreMotivation}"</strong>는 것이 모든 행동의 가장 강력한 원동력이 됩니다.
        </div>
      </div>
    `;

    // ── 2. 내면의 갈등 메커니즘 (두려움과 스트레스 방향) ──
    let conflictText = `${escapeHtml(name)}님의 내면 가장 깊은 곳에는 <strong>"${mainEnnea.data.coreFear}"</strong>라는 무의식적인 두려움이 자리잡고 있습니다.<br><br>`;
    conflictText += `이러한 두려움이 자극되거나 극심한 스트레스를 받을 때, 평소의 긍정적인 모습 대신 <strong>${mainEnnea.data.stressDirection}</strong>는 불건강한 패턴으로 빠지기 쉽습니다. 이는 ${mbtiType}의 약점인 ${mbti.weaknesses.slice(0, 2).join(', ')}과 맞물려 상황을 더 어렵게 만들 수 있습니다.`;

    const hasOptionals = coreEmotions.length > 0 || coreBeliefs.length > 0 || defenseMechanisms.length > 0;

    if (hasOptionals) {
      conflictText += `<br><br>특히 스트레스 상황에서 다음과 같은 심리적 역동이 일어날 수 있습니다:`;
      if (coreBeliefs.length > 0) {
        const beliefNames = coreBeliefs.map(id => typeof CORE_BELIEFS_DATA !== 'undefined' && CORE_BELIEFS_DATA[id] ? `"${CORE_BELIEFS_DATA[id].def}"` : null).filter(Boolean);
        if (beliefNames.length > 0) {
          conflictText += `<br>• <strong>비합리적 신념</strong>: 내면에 ${beliefNames.join(', ')}이라는 굳어진 신념이 작동하여 스스로를 압박합니다.`;
        }
      }
      if (coreEmotions.length > 0) {
        const emotionNames = coreEmotions.map(id => typeof CORE_EMOTIONS_DATA !== 'undefined' && CORE_EMOTIONS_DATA[id] ? CORE_EMOTIONS_DATA[id].name : null).filter(Boolean);
        if (emotionNames.length > 0) {
          conflictText += `<br>• <strong>핵심 감정</strong>: 그 결과, <strong>${emotionNames.join(', ')}</strong> 등의 감정에 깊게 휩싸이게 됩니다.`;
        }
      }
      if (defenseMechanisms.length > 0) {
        const defNames = defenseMechanisms.map(id => typeof DEFENSE_MECHANISMS_DATA !== 'undefined' && DEFENSE_MECHANISMS_DATA[id] ? DEFENSE_MECHANISMS_DATA[id].name : null).filter(Boolean);
        if (defNames.length > 0) {
          conflictText += `<br>• <strong>방어기제</strong>: 자아를 보호하기 위해 무의식적으로 <strong>${defNames.join(', ')}</strong> 방어기제를 사용하여 상황을 회피하거나 합리화하려 할 수 있습니다.`;
        }
      }
    }

    html += `
      <div class="synergy-item">
        <div class="synergy-item__label">⚡ 내면의 두려움과 스트레스 패턴</div>
        <div class="synergy-item__text" style="line-height:1.6;">${conflictText}</div>
      </div>
    `;

    // ── 3. 맞춤형 솔루션 및 성장 방향 ──
    let solutionText = `${escapeHtml(name)}님이 진정한 안정을 찾고 한 단계 도약하기 위한 가장 이상적인 길은 <strong>${mainEnnea.data.growthDirection}</strong>는 것입니다.<br><br>`;
    
    // Add belief-based solution
    if (coreBeliefs.length > 0) {
      const firstBelief = typeof CORE_BELIEFS_DATA !== 'undefined' ? CORE_BELIEFS_DATA[coreBeliefs[0]] : null;
      if (firstBelief) {
        solutionText += `현재 가지고 있는 "${firstBelief.name}" 신념에 대해서는, <strong>"${firstBelief.rebuttal}"</strong>라고 스스로에게 말해주는 연습이 필요합니다. `;
      }
    }

    // Add emotion-based growth
    if (coreEmotions.length > 0) {
      const firstEmotion = typeof CORE_EMOTIONS_DATA !== 'undefined' ? CORE_EMOTIONS_DATA[coreEmotions[0]] : null;
      if (firstEmotion && firstEmotion.direction) {
        solutionText += `또한 자주 느끼는 ${firstEmotion.name} 감정이 올라올 때 <strong>"${firstEmotion.direction}"</strong>는 방식으로 접근해 보세요. `;
      }
    }

    // Add defense mechanism counsel
    if (defenseMechanisms.length > 0) {
      const firstDef = typeof DEFENSE_MECHANISMS_DATA !== 'undefined' ? DEFENSE_MECHANISMS_DATA[defenseMechanisms[0]] : null;
      if (firstDef && firstDef.counsel) {
        solutionText += `무의식적으로 자주 나타나는 ${firstDef.name} 방어기제와 관련하여, <strong>"${firstDef.counsel}"</strong>는 점을 꼭 기억해 주세요. `;
      }
    }

    solutionText += `더불어 ${subEnnea1.type}유형과 ${subEnnea2.type}유형이 가진 긍정적인 강점인 ${subEnnea1.data.strengths[0]}과 ${subEnnea2.data.strengths[0]}을 적절히 활용한다면 더 균형 잡히고 성숙한 내면을 가꿀 수 있습니다.`;

    html += `
      <div class="synergy-item">
        <div class="synergy-item__label">🌱 통합적 성장 방향</div>
        <div class="synergy-item__text" style="line-height:1.6;">${solutionText}</div>
      </div>
    `;

    // ── 4. 소통 가이드 (Communication Tips) ──
    html += `
      <div class="synergy-item">
        <div class="synergy-item__label">💬 맞춤 소통 가이드</div>
        <div class="synergy-item__text" style="line-height:1.6; background:var(--bg-body); padding:16px; border-radius:8px;">
          <strong style="color:var(--text-primary);">${mainEnnea.type}유형(${mainEnnea.data.name})에 맞춘 대화법:</strong><br>
          • ${mainEnnea.data.communicationTips[0]}<br>
          • ${mainEnnea.data.communicationTips[1] || mainEnnea.data.communicationTips[0]}<br><br>
          <strong style="color:var(--text-primary);">${mbtiType}의 관계 스타일:</strong><br>
          • ${mbti.relationshipStyle}
        </div>
      </div>
    `;

    html += `</div></div>`; // close synergy-card

    // ── Action Buttons ──
    html += `
      <div style="text-align: center; margin-top: 40px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <button class="btn-new" id="captureBtn" type="button" style="background: var(--gradient-primary); color: white; border: none; box-shadow: var(--shadow-sm);">
          <span>📸</span> 이미지로 저장하기
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
        captureBtn.innerHTML = '<span>⏳</span> 이미지 저장 중...';
        captureBtn.disabled = true;

        // Hide buttons during capture
        const actionButtons = captureBtn.parentElement;
        actionButtons.style.display = 'none';

        try {
          const isMobile = window.innerWidth <= 768;
          const canvas = await html2canvas(resultsSection, {
            scale: isMobile ? 1 : 2, // 모바일 메모리 초과 방지 (1.0으로 낮춤)
            useCORS: true,
            backgroundColor: '#f8fafc'
          });
          
          const filename = `${name}_성향분석결과.png`;
          const dataUrl = canvas.toDataURL('image/png');

          if (isMobile) {
            // 모바일 환경: 이미지 모달을 띄워서 길게 눌러 저장하도록 유도
            showImageModal(dataUrl);
          } else {
            // PC 환경: 즉시 다운로드
            fallbackDownload(dataUrl, filename);
          }
        } catch (err) {
          console.error('캡쳐 실패:', err);
          alert('결과 캡쳐에 실패했습니다. (메모리 부족 또는 브라우저 제한일 수 있습니다)');
        } finally {
          // Restore buttons
          actionButtons.style.display = 'flex';
          captureBtn.innerHTML = originalText;
          captureBtn.disabled = false;
        }
      });
    }

    function fallbackDownload(dataUrl, filename) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    }

    function showImageModal(dataUrl) {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.padding = '20px';
      
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕ 닫기';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '20px';
      closeBtn.style.right = '20px';
      closeBtn.style.background = 'white';
      closeBtn.style.color = '#333';
      closeBtn.style.border = 'none';
      closeBtn.style.padding = '8px 16px';
      closeBtn.style.borderRadius = '20px';
      closeBtn.style.fontWeight = 'bold';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      
      const guideText = document.createElement('div');
      guideText.innerHTML = '📸 <strong>이미지를 길게 눌러서 \'내 폰에 저장\'</strong> 해주세요!';
      guideText.style.color = 'white';
      guideText.style.marginBottom = '16px';
      guideText.style.fontSize = '1.1rem';
      guideText.style.textAlign = 'center';
      guideText.style.lineHeight = '1.4';

      const imgWrapper = document.createElement('div');
      imgWrapper.style.overflowY = 'auto';
      imgWrapper.style.maxWidth = '100%';
      imgWrapper.style.maxHeight = '80vh';
      imgWrapper.style.borderRadius = '12px';
      imgWrapper.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      
      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.width = '100%';
      img.style.display = 'block';
      
      imgWrapper.appendChild(img);
      overlay.appendChild(closeBtn);
      overlay.appendChild(guideText);
      overlay.appendChild(imgWrapper);
      
      document.body.appendChild(overlay);
      
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
      });
    }
  }

  // Utility: escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});

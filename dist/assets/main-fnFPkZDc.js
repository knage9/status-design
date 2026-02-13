import"./metrika-BY1HYfmI.js";import"./discount-popup-C8REf4fq.js";import"./news-data-DPVDa9uH.js";class r{constructor(){this.init()}init(){this.loadMainNews()}async loadMainNews(){try{const a=await fetch("/api/posts");if(!a.ok)throw new Error("Failed to fetch news");const n=(await a.json()).map(e=>{const s=e.datePublished||e.dateCreated;return{id:e.id,title:e.title,date:s,type:e.type==="NEWS"?"news":"article",category:e.category==="NEWS"?"news":"articles",content:e.content,image:e.image||null,tags:e.tags||[],slug:e.slug}}).sort((e,s)=>new Date(s.date)-new Date(e.date)).slice(0,4);this.renderMainNews(n)}catch{const t=document.querySelector(".news__grid");t&&(t.innerHTML='<div class="no-news">Не удалось загрузить новости. Пожалуйста, обновите страницу.</div>')}}renderMainNews(a){const t=document.querySelector(".news__grid");if(t){if(t.innerHTML="",a.length===0){t.innerHTML='<div class="no-news">Новости не найдены</div>';return}a.forEach(n=>{const e=this.createMainNewsCard(n);t.appendChild(e)})}}createMainNewsCard(a){const t=document.createElement("div");t.className=`news-card news-card--${a.type}`,t.setAttribute("data-id",a.id);let n="";const e=typeof formatDate=="function"?formatDate(a.date):a.date;if(a.type==="news"&&a.image)n=`
                <div class="news-card__image">
                    <img src="${a.image}" alt="${a.title}">
                </div>
                <div class="news-card__content">
                    <div class="news-card__date">${e}</div>
                    <h3 class="news-card__title">${a.title}</h3>
                    <div class="news-card__tags">
                        ${a.tags.map(s=>`<span class="news-tag">${s}</span>`).join("")}
                    </div>
                </div>
            `;else{const s=a.content.length>120?a.content.substring(0,120)+"...":a.content;n=`
                <div class="news-card__content">
                    <div class="news-card__date">${e}</div>
                    <h3 class="news-card__title">${a.title}</h3>
                    <p class="news-card__description">${s}</p>
                    <div class="news-card__tags">
                        ${a.tags.map(i=>`<span class="news-tag">${i}</span>`).join("")}
                    </div>
                </div>
            `}return t.innerHTML=n,t.addEventListener("click",()=>{a.slug?window.location.href=`news-detail.html?slug=${a.slug}`:window.location.href=`news.html#${a.id}`}),t}}document.addEventListener("DOMContentLoaded",()=>{document.querySelector(".news__grid")&&new r});

import"./metrika-BY1HYfmI.js";/* empty css             */import"./news-data-DPVDa9uH.js";import"./discount-popup-C8REf4fq.js";class d{constructor(){this.slug=this.getSlugFromUrl(),this.newsData=null,this.relatedNews=[],this.init()}init(){this.slug?this.loadNewsData():this.showError("Новость не найдена")}getSlugFromUrl(){return new URLSearchParams(window.location.search).get("slug")}async loadNewsData(){try{const t=await fetch(`/api/posts/${this.slug}`);if(!t.ok)throw new Error("Post not found");const e=await t.json();this.newsData={id:e.id,title:e.title,rawDate:e.datePublished||e.dateCreated,date:new Date(e.datePublished||e.dateCreated).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),type:e.type==="NEWS"?"news":"article",category:e.category==="NEWS"?"news":"articles",content:e.content,image:e.image||null,views:e.views,tags:e.tags||[],slug:e.slug},this.renderNewsDetail(),this.updateMetaTags(),this.updateStructuredData(),this.loadRelatedNews(),this.incrementViews()}catch{this.showError("Новость не найдена")}}async incrementViews(){try{await fetch(`/api/posts/${this.slug}/increment-views`,{method:"POST"})}catch{}}renderNewsDetail(){const t=document.getElementById("newsDetail");if(!t||!this.newsData)return;const e=this.createNewsDetailHtml();t.innerHTML=e;const s=t.querySelector(".news-detail__cta .btn-primary");s&&typeof openPopup=="function"&&s.addEventListener("click",i=>{i.preventDefault(),openPopup()}),this.updateBreadcrumb()}createNewsDetailHtml(){const{newsData:t}=this;return t.type==="news"&&t.image?`
                <div class="news-detail__header">
                    <div class="news-detail__image">
                        <img src="${t.image}" alt="${t.title}" loading="lazy">
                    </div>
                </div>
                <div class="news-detail__content">
                    <div class="news-detail__meta">
                        <div class="news-detail__date">${t.date}</div>
                        <div class="news-detail__type">${this.getTypeLabel(t.type)}</div>
                        <div class="news-detail__views">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            ${t.views} просмотров
                        </div>
                    </div>
                    <h1 class="news-detail__title">${t.title}</h1>
                    <div class="news-detail__text">
                        ${this.formatNewsContent(t.content)}
                    </div>
                    <div class="news-detail__tags">
                        ${t.tags.map(e=>`<span class="news-tag news-tag--detail">${e}</span>`).join("")}
                    </div>
                    <div class="news-detail__cta">
                        <button class="btn-primary" id="newsDiscussBtn">
                            Обсудить проект
                        </button>
                    </div>
                </div>
            `:`
                <div class="news-detail__content news-detail__content--text">
                    <div class="news-detail__meta">
                        <div class="news-detail__date">${t.date}</div>
                        <div class="news-detail__type">${this.getTypeLabel(t.type)}</div>
                        <div class="news-detail__views">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            ${t.views} просмотров
                        </div>
                    </div>
                    <h1 class="news-detail__title">${t.title}</h1>
                    <div class="news-detail__text">
                        ${this.formatNewsContent(t.content)}
                    </div>
                    <div class="news-detail__tags">
                        ${t.tags.map(e=>`<span class="news-tag news-tag--detail">${e}</span>`).join("")}
                    </div>
                    <div class="news-detail__cta">
                        <button class="btn-primary">
                            ${t.category==="actions"?"Воспользоваться предложением":"Обсудить проект"}
                        </button>
                    </div>
                </div>
            `}formatNewsContent(t){return t.split(`
`).map(e=>{const s=e.trim();return s?`<p>${s}</p>`:""}).join("")}getTypeLabel(t){switch(t){case"news":return"Новости";case"article":return"Статья";default:return"Новость"}}updateMetaTags(){if(!this.newsData)return;const{newsData:t}=this,e=document.getElementById("news-title");e&&(e.textContent=`${t.title} - Тюнинг премиум класса в Москве | Status Design`);const s=document.getElementById("news-description");if(s){const n=t.content.substring(0,150)+"...";s.setAttribute("content",n)}const i=document.getElementById("news-keywords");if(i){const n=this.generateKeywords(t);i.setAttribute("content",n)}const a=document.getElementById("news-canonical");if(a){const n=`https://statusdesign.ru/news-detail.html?id=${t.id}`;a.setAttribute("href",n)}this.updateOpenGraphTags(),this.updateTwitterTags(),this.updatePublishTime()}generateKeywords(t){const e=["тюнинг","автомобиль","Москва","премиум класс"],s=t.title.toLowerCase().split(" ").filter(n=>n.length>3),i=t.tags.flatMap(n=>n.toLowerCase().split(" "));return[...new Set([...e,...s,...i])].slice(0,10).join(", ")}updateOpenGraphTags(){const{newsData:t}=this,e=document.getElementById("news-og-url");e&&e.setAttribute("content",`https://statusdesign.ru/news-detail.html?id=${t.id}`);const s=document.getElementById("news-og-title");s&&s.setAttribute("content",`${t.title} - Status Design`);const i=document.getElementById("news-og-description");if(i){const r=t.content.substring(0,200)+"...";i.setAttribute("content",r)}const a=document.getElementById("news-og-image");if(a){const r=t.image||"img/news_img_1.png";a.setAttribute("content",`https://statusdesign.ru/${r}`)}const n=document.getElementById("news-section");n&&n.setAttribute("content",this.getTypeLabel(t.type))}updateTwitterTags(){const{newsData:t}=this,e=document.getElementById("news-twitter-url");e&&e.setAttribute("content",`https://statusdesign.ru/news-detail.html?id=${t.id}`);const s=document.getElementById("news-twitter-title");s&&s.setAttribute("content",`${t.title} - Status Design`);const i=document.getElementById("news-twitter-description");if(i){const n=t.content.substring(0,200)+"...";i.setAttribute("content",n)}const a=document.getElementById("news-twitter-image");if(a){const n=t.image||"img/news_img_1.png";a.setAttribute("content",`https://statusdesign.ru/${n}`)}}updatePublishTime(){const{newsData:t}=this,e=document.getElementById("news-published-time");if(e&&t.rawDate){const i=new Date(t.rawDate);isNaN(i.getTime())||e.setAttribute("content",i.toISOString())}const s=document.getElementById("news-modified-time");if(s&&t.rawDate){const i=new Date(t.rawDate);isNaN(i.getTime())||s.setAttribute("content",i.toISOString())}}updateBreadcrumb(){const t=document.getElementById("breadcrumb-current");t&&(t.textContent=this.newsData.title)}async loadRelatedNews(){if(this.newsData)try{const t=await fetch("/api/posts");if(!t.ok)throw new Error("Failed to fetch posts");const i=(await t.json()).filter(a=>a.id!==this.newsData.id).map(a=>{const n=this.transformPostData(a),r=this.calculateSimilarityScore(this.newsData,n);return{...n,similarityScore:r}});i.sort((a,n)=>{if(n.similarityScore!==a.similarityScore)return n.similarityScore-a.similarityScore;const r=new Date(a.rawDate),o=new Date(n.rawDate);return o.getTime()!==r.getTime()?o.getTime()-r.getTime():(n.views||0)-(a.views||0)}),this.relatedNews=i.slice(0,4),this.renderRelatedNews()}catch{}}calculateSimilarityScore(t,e){let s=0;const i=t.tags||[],a=e.tags||[],n=i.filter(r=>a.includes(r));return s+=n.length*10,t.type===e.type&&(s+=5),t.category===e.category&&(s+=3),s}transformPostData(t){return{id:t.id,title:t.title,rawDate:t.datePublished||t.dateCreated,date:new Date(t.datePublished||t.dateCreated).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),type:t.type==="NEWS"?"news":"article",category:t.category==="NEWS"?"news":"articles",content:t.content,image:t.image?t.image:null,views:t.views,tags:t.tags||[],slug:t.slug}}renderRelatedNews(){const t=document.getElementById("relatedNewsGrid");!t||this.relatedNews.length===0||(t.innerHTML="",this.relatedNews.forEach(e=>{const s=this.createRelatedNewsCard(e);t.appendChild(s)}))}createRelatedNewsCard(t){const e=document.createElement("div");e.className=`news-card news-card--${t.type}`,e.setAttribute("data-id",t.id);let s="";if(t.type==="news"&&t.image)s=`
                <div class="news-card__image">
                    <img src="${t.image}" alt="${t.title}">
                </div>
                <div class="news-card__content">
                    <div class="news-card__date">${t.date}</div>
                    <h3 class="news-card__title">${t.title}</h3>
                    <div class="news-card__tags">
                        ${t.tags.map(i=>`<span class="news-tag">${i}</span>`).join("")}
                    </div>
                </div>
            `;else{const i=this.truncateTextByLines(t.content,4);s=`
                <div class="news-card__content">
                    <div class="news-card__date">${t.date}</div>
                    <h3 class="news-card__title">${t.title}</h3>
                    <p class="news-card__description">${i}</p>
                    <div class="news-card__tags">
                        ${t.tags.map(a=>`<span class="news-tag">${a}</span>`).join("")}
                    </div>
                </div>
            `}return e.innerHTML=s,e.addEventListener("click",()=>{window.location.href=`news-detail.html?slug=${t.slug}`}),e}truncateTextByLines(t,e){if(!t)return"";const s=document.createElement("div");s.style.position="absolute",s.style.visibility="hidden",s.style.height="auto",s.style.width="280px",s.style.lineHeight="1.25",s.style.fontSize="18px",s.style.fontFamily="Inter, sans-serif",s.style.wordWrap="break-word",document.body.appendChild(s);let i="";const a=t.trim().split(" ");for(let n=0;n<a.length;n++)if(s.textContent=a.slice(0,n+1).join(" ")+"...",Math.round(s.scrollHeight/(parseInt(s.style.lineHeight)*parseInt(s.style.fontSize)))>e){i=a.slice(0,n).join(" ")+"...";break}return i||(i=t),document.body.removeChild(s),i}truncateText(t,e){return!t||t.length<=e?t:t.substring(0,e).replace(/\s+\w*$/,"")+"..."}updateStructuredData(){const t=document.getElementById("newsStructuredData");if(!t||!this.newsData)return;const{newsData:e}=this,s=`https://statusdesign.ru/news-detail.html?slug=${e.slug}`;let i=new Date(e.rawDate),a=null;isNaN(i.getTime())||(a=i.toISOString());const n={"@context":"https://schema.org","@type":"NewsArticle",headline:e.title,description:e.content.substring(0,200)+"...",image:e.image?e.image:"https://statusdesign.ru/img/news_img_1.png",datePublished:a,dateModified:a,author:{"@type":"Organization",name:"Status Design",url:"https://statusdesign.ru"},publisher:{"@type":"Organization",name:"Status Design",logo:{"@type":"ImageObject",url:"https://statusdesign.ru/img/logo.svg"}},mainEntityOfPage:{"@type":"WebPage","@id":s},breadcrumb:{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Главная",item:"https://statusdesign.ru/"},{"@type":"ListItem",position:2,name:"Новости",item:"https://statusdesign.ru/news.html"},{"@type":"ListItem",position:3,name:e.title,item:s}]}};t.textContent=JSON.stringify(n,null,2)}showError(t){const e=document.getElementById("newsDetail");e&&(e.innerHTML=`
                <div class="news-detail__error">
                    <h1>Ошибка</h1>
                    <p>${t}</p>
                    <button class="btn-primary" onclick="window.location.href='news.html'">
                        Вернуться к новостям
                    </button>
                </div>
            `)}}document.addEventListener("DOMContentLoaded",()=>{new d});

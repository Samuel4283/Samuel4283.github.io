<template>
  <div class="quiz-app">
    <div class="check-bar">
        <div v-if="currentView === 'quiz'" class="setup-group">
        <label>考題數量：</label>
        <select v-model="quizLimit" @change="initQuiz" class="num-select">
          <option :value="10">10 題</option>
          <option :value="20">20 題</option>
          <option :value="50">50 題</option>
          <option :value="Object.keys(rawData).length">全部 ({{ Object.keys(rawData).length }})</option>
        </select>
      </div>
        <button v-if="currentView != `result`" class="btn btn-ref" @click="currentView = currentView == 'reference'? 'quiz' : 'reference'"> {{ currentView === 'reference' ? '返回題目' : '對照表' }} </button>
        <button v-if="currentView != `result`" class="btn btn-submit" @click="submitQuiz">提交答案</button>
        <button v-if="currentView == `result`" class="btn btn-submit" @click="restart">重新開始</button>
      </div>
    <div v-if="currentView === 'quiz'" class="container quiz">
      <div class="quiz-list">
        <div v-for="(q, index) in shuffledQuestions" :key="q.question" class="quiz-item">
          <div class="q-text">{{ index + 1 }}.&nbsp; {{ q.question }}</div>
          <div class="input-wrapper">
    <input 
      type="number" 
      v-model.number="userAnswers[q.question]" 
      placeholder="Ans:"
      class="id-input"
    />
    <button class="btn-pick" @click="goToPick(q.question)">🔍</button>
  </div>
        </div>
      </div>

      
    </div>

    <div v-else-if="currentView === 'reference'" class="container ans">
      <h3>答案對照表</h3>
      <div class="answer-grid">
  <div 
    v-for="ans in sortedAnswers" 
    :key="ans.id" 
    class="answer-card pickable" 
    @click="pickAnswer(ans.id)"
  >
    <span class="id-badge">Ans: {{ ans.id }}</span>
    <span class="ans-text">{{ ans.text }}</span>
  </div>
</div>
    </div>

    <div v-else-if="currentView === 'result'" class="container res">
      <h2>測驗結果</h2>
      <div v-if="errors.length === 0" class="success-msg">🎉 太厲害了！全對！</div>
      <div v-else class="error-list">
        <div v-for="err in errors" :key="err.q" class="error-item">
          <p><strong>題目：</strong>{{ err.q }}</p>
          <p>您的填寫：
        <span class="text-red">
          {{ 
            sortedAnswers.find(a => a.id === err.userVal)?.text || (err.userVal ? '查無此 ID ：' + err.userVal : '未填') 
          }}
        </span>
      </p>
          <p>正確答案：<span class="text-green">{{ err.correctText }} </span></p>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// --- 靜態資料集 ---
const rawData = {
  "The fifth generation of cellular network technology, promising faster data speeds, lower latency, and greater connectivity for mobile devices and applications.": "5G",
  "Visual artworks or photos created using artificial intelligence algorithms that mimic human artistic styles or generate entirely new images autonomously.": "AI Art & Generated Images",
  "Music compositions generated or enhanced by artificial intelligence algorithms, which can analyze patterns, create melodies, and even generate entire songs without human intervention.": "AI Music",
  "A vehicle, also known as a self-driving or driverless car, equipped with sensors, cameras, and AI technology that enables it to navigate and operate on roads without human input.": "Autonomous Car",
  "A cloud computing platform offered by Amazon, providing a wide range of on-demand computing services, including storage, databases, analytics, machine learning, and more.": "Amazon Web Services (AWS)",
  "The process of identifying and analyzing the search terms that users enter into search engines, used to optimize website content and attract targeted traffic.": "Keyword Research",
  "The policies, technologies, and controls implemented to protect data, applications, and infrastructure hosted in cloud computing environments from cyber threats and unauthorized access.": "Cloud Security",
  "IT services delivered over the internet from remote servers, including computing power, storage, databases, networking, software, and more.": "Clouding Services",
  "The process of converting plain text or data into encoded ciphertext using cryptographic algorithms, making it unreadable to unauthorized users, and ensuring data security and confidentiality.": "Data encryption",
  "The practices, strategies, and technologies used by businesses to manage and analyze interactions with current and potential customers, aiming to improve customer retention, loyalty, and satisfaction.": "Customer Relationship Management (CRM)",
  "A digital or virtual currency that uses cryptography for security and operates independently of a central authority, such as a government or bank.": "Cyptocurrency",
  "The practice of promoting products or services using digital channels such as websites, social media, email, search engines, and mobile apps.": "Digital Marketing",
  "Software that integrates core business processes, such as accounting, human resources, supply chain management, and customer relationship management, into a single system.": "Enterprise Resource Planning (ERP)",
  "The corporate headquarters complex of Google LLC, located in Mountain View, California, known for its innovative design and amenities for employees.": "Googleplex",
  "The current trend of automation and data exchange in manufacturing technologies, including the Internet of Things (IoT), cloud computing, artificial intelligence, and cyber-physical systems.": "Industry 4.0",
  "A security mechanism that requires users to provide two or more forms of verification, such as passwords, biometric data, or security tokens, to access a system or account.": "Multi-factor authentication (MFA)",
  "The practice of contracting out IT functions or services to external service providers, typically to reduce costs, access specialized expertise, or improve efficiency.": "IT Outsourcing",
  "A form of e-commerce where products or services are promoted and sold to customers in real-time through live video broadcasts over the internet.": "Live Stream Selling",
  "HTML elements that provide information about a web page to search engines, including title tags, meta descriptions, and meta keywords, influencing search engine rankings and click-through rates.": "Meta Tags",
  "The phenomenon where a large number of niche products or services collectively can outsell the few best-selling products, often enabled by online platforms and distribution channels.": "Long Tail Principle",
  "Conducting business activities, such as marketing, sales, and transactions, through mobile devices such as smartphones and tablets.": "Mobile Business",
  "A retail establishment that operates without staff present, typically utilizing technology such as self-checkout systems, automated inventory tracking, and security measures.": "Unmanned Shop",
  "An online advertising model where advertisers pay a fee each time their ad is clicked, commonly used in search engine advertising platforms like Google Ads.": "PPC Marketing",
  "Technology that uses software robots or 'bots' to automate repetitive tasks and processes, typically in business environments, to improve efficiency and accuracy.": "Robotic Process Automation (RPA)",
  "Computer-generated models or simulations used to emulate the behavior and performance of robots in various environments or scenarios, often used for testing and training purposes.": "Robotic Simulations",
  "The process of optimizing websites and online content to improve their visibility and ranking in search engine results pages, thereby increasing organic (non-paid) traffic.": "Search Engine Optimization (SEO)",
  "The process of determining the emotional tone or attitude expressed in text, often categorized as positive, negative, or neutral.": "Sentiment Analysis",
  "An economic system based on shared access to goods, services, and resources, often facilitated by online platforms that enable individuals or businesses to share or rent assets with others.": "Sharing Economy",
  "The use of advanced technologies such as IoT sensors, drones, and data analytics to improve farming practices, increase crop yields, and optimize resource usage in agriculture.": "Smart Agriculture",
  "The integration of advanced technologies such as AI, IoT, and data analytics into healthcare systems and practices to improve patient care, enhance efficiency, and optimize resource utilization.": "Smart Healthcare",
  "The use of advanced technologies such as IoT, AI, and data analytics to optimize and automate various processes within the supply chain, enhancing efficiency, visibility, and responsiveness.": "Smart Supply Chain Mangement",
  "The application of technology, such as sensors, cameras, and AI algorithms, to monitor and manage traffic flow in real-time, aiming to reduce congestion, improve safety, and enhance transportation efficiency.": "Smart Traffic",
  "The use of social media platforms to promote products or services, engage with audiences, and build brand awareness and loyalty through targeted advertising, content creation, and community management.": "Social Media Marketing",
  "A live music performance streamed online, allowing audiences to watch and listen to the concert remotely via internet-connected devices.": "Virtual Concert",
  "A digital service that delivers audio or video content over the internet to users' devices in real-time, allowing them to watch or listen to content on-demand.": "Online Streaming Platform",
  "A biometric technology that uses algorithms to identify or verify individuals based on their facial features captured by cameras or other imaging devices.": "Face Recognition",
  "A technique that produces three-dimensional images using laser light to record and reconstruct the light field reflected from objects, creating the illusion of depth and dimensionality.": "Holography",
  "A payment option that allows consumers to make purchases and defer payment, typically with no interest or fees, and pay for their purchases in installments over time.": "Buy Now Pay Later (BNPL)",
  "The latest phase of banking characterized by the integration of digital technologies such as mobile banking, AI-powered chatbots, and personalized financial services.": "Bank 4.0",
  "A computerized system that processes and records transactions such as sales, purchases, and payments in real-time, ensuring data accuracy and reliability for business operations.": "Transaction Processing System",
  "Processes and strategies for capturing, organizing, sharing, and leveraging knowledge and information within an organization to improve decision-making, innovation, and performance.": "Knowledge Management (KM)",
  "An online collection of digital resources such as e-books, journals, videos, and databases, accessible via the internet for research, education, and entertainment purposes.": "Digital Library",
  "The use of mobile devices such as smartphones or tablets to make transactions, including purchases, bill payments, and money transfers, using mobile apps or contactless technology.": "Mobile Payment",
  "Synthetic media, typically videos, that are created or altered using deep learning techniques to replace the likeness of a person in an existing video with someone else's likeness.": "Deepfake",
  "An urban area that uses advanced technologies such as IoT, AI, and data analytics to improve infrastructure, services, and quality of life for residents.": "Smart City",
  "A digital assistant or software application that uses AI algorithms to provide personalized recommendations, advice, or assistance to users based on their preferences, behaviors, and context.": "Intelligent Advisor",
  "The remote delivery of healthcare services, including medical consultations, diagnosis, and treatment, using telecommunications technology such as video conferencing and mobile apps.": "Telemedicine",
  "Robots equipped with sensors, AI algorithms, and advanced control systems that enable them to perceive their environment, make decisions, and perform tasks autonomously or semi-autonomously.": "Intelligent Robots",
  "A chain of convenience stores operated by Amazon that utilize advanced technologies such as computer vision, sensor fusion, and machine learning to enable cashier-less shopping experiences.": "Amazon Go",
  "The network of interconnected medical devices, sensors, and wearables that collect and exchange health data to monitor patients, diagnose conditions, and improve healthcare delivery.": "Internet Of Medical Things (IoMT)",
  "The use of artificial intelligence technologies to conduct job interviews, assess candidates' skills and qualifications, and provide automated feedback to recruiters.": "AI Interview",
  "The use of advanced technologies such as AI, machine learning, and robotic process automation (RPA) to automate and optimize a wide range of business processes, workflows, and tasks.": "Hyperautomation",
  "The use of computer software to create, modify, analyze, and optimize designs for products, buildings, or mechanical components.": "Computer-Aided Design (CAD)",
  "Interactive and multi-sensory experiences that deeply engage users through virtual reality (VR), augmented reality (AR), or mixed reality (MR) technologies.": "Immersive Experience",
  "A business strategy aimed at improving customer satisfaction and loyalty by quickly and effectively addressing customer inquiries, concerns, or requests.": "Efficient Customer Responese (ECR)",
  "A virtual replica or representation of a physical object, process, or system, used for simulation, monitoring, and analysis purposes to optimize performance and decision-making.": "Digital Twin",
  "Large volumes of data generated by industrial processes, machinery, and sensors, which can be analyzed to improve efficiency, productivity, and predictive maintenance in manufacturing.": "Industrial Big Data",
  "An approach to web design that ensures websites automatically adjust and adapt their layout, content, and functionality based on the user's device and screen size.": "Responsive Web Design (RWD)",
  "A database management system (DBMS) and software application used to create, manage, and manipulate relational databases for storing and retrieving data.": "Microsoft Access",
  "A business analytics tool developed by Microsoft that enables users to visualize and analyze data from various sources, create interactive reports and dashboards, and share insights.": "Power BI",
  "The use of digital technologies and processes to streamline and optimize business operations, improve efficiency, and enhance customer experiences.": "Digital Operation",
  "Strategies and techniques to improve a website's visibility and ranking in search engine results pages (SERPs) through paid advertising (PPC) and search engine optimization (SEO).": "Search Engine Management(SEM)",
  "Optimizing individual web pages to rank higher and earn more relevant traffic in search engines by improving content, meta tags, and HTML source code.": "On-Page Optimization",
  "Activities conducted outside of a website to improve its search engine rankings, including building backlinks, social media engagement, and influencer outreach.": "Off-Page Optimization",
  "A comprehensive evaluation of a website's performance and optimization factors, identifying areas for improvement in technical, on-page, and off-page aspects of SEO.": "SEO Audit",
  "An umbrella term that encompasses virtual reality (VR), augmented reality (AR), and mixed reality (MR) technologies, creating immersive and interactive digital experiences.": "Extended Reality (XR)",
  "A web analytics service offered by Google that tracks and analyzes website traffic, user behavior, and performance metrics to help website owners understand and optimize their online presence.": "Google Analytics",
  "The ability to use computers and digital technologies effectively, including basic skills such as operating systems, software applications, internet browsing, and file management.": "Computer Literacy",
  "A data visualization tool that displays key performance indicators (KPIs), metrics, and analytics in a graphical format, providing real-time insights and monitoring of business processes.": "Digital Dashboard",
  "A specialized information system designed to provide top-level executives and decision-makers with access to relevant data, reports, and analysis to support strategic decision-making.": "Executive Support System (ESS)",
  "A software application or AI-powered chatbot that provides assistance and performs tasks for users, such as answering questions and scheduling appointments, often through voice commands or text interactions.": "Virtual Assistant",
  "A management approach that focuses on optimizing and improving business processes to achieve organizational goals, often involving the analysis, design, automation, and monitoring of workflows.": "Business Process Management (BPM)",
  "A concept that describes the series of activities and processes involved in delivering a product or service to customers, from raw materials sourcing to production, with each stage adding value.": "Value Chain",
  "The clickable text of a hyperlink, used to provide context and indicate the topic or destination of the linked page, influencing search engine ranking and relevance.": "Anchor Text",
  "An organization that operates primarily or entirely in a digital or virtual environment, with remote workers, online collaboration tools, and cloud-based systems, rather than a physical office.": "Virtual Company",
  "The delivery of computing resources, such as servers, storage, and applications, over the internet on an as-needed basis, allowing users to scale resources up or down based on demand.": "On-Demand Computing",
  "A private network that extends an organization's internal network to selected external users, such as partners, suppliers, or customers, providing secure access to shared resources.": "Extranet",
  "A private network used by an organization to facilitate internal communication, collaboration, and information sharing among employees, typically accessed through web browsers.": "Intranet",
  "Individuals who write and develop computer programs, software applications, or scripts using programming languages to instruct computers to perform specific tasks or functions.": "Programmers",
  "Organizations that integrate social and environmental objectives into their mission and operations, aiming to generate positive social impact alongside financial returns.": "Social Business",
  "The gap between individuals or communities who have access to digital technologies and the internet and those who do not, often due to socioeconomic factors or infrastructure limitations.": "Digital Divide",
  "Malicious software that secretly monitors and collects information about a user's activities on a computer or device without their consent, often used for surveillance or data theft.": "Spyware",
  "The use of information technology in ways that minimize environmental impact, such as reducing energy consumption, recycling electronic waste, and using renewable resources.": "Green IT",
  "A computing environment that combines public cloud services with private cloud infrastructure, allowing organizations to leverage the scalability and flexibility of the cloud while retaining control.": "Hybrid Cloud",
  "The ability of a computer system, software application, or infrastructure to handle increasing workloads and accommodate growing demands, typically achieved through hardware upgrades or optimization.": "System Scalability",
  "A technology used for querying and analyzing multidimensional data from various perspectives, enabling users to perform complex data analysis, reporting, and visualization.": "Online Analytical Processing(OLAP)",
  "A programming language used for managing and manipulating relational databases, allowing users to perform tasks such as querying data, updating records, and defining database structures.": "Structured Query Language(SQL)",
  "The process of extracting useful information and patterns from web data, including web pages, user behavior, and online transactions, using data mining techniques and algorithms.": "Web Mining",
  "The process of optimizing mobile apps to improve their visibility and ranking in app store search results, increasing app downloads, user engagement, and revenue.": "App Store Optimization (ASO)",
  "A hyperlink from one web page to another, typically used to improve search engine ranking and increase website traffic, as search engines consider them as a measure of a website's authority.": "Blacklink",
  "A small piece of data stored on a user's computer by a web browser, typically used to track and remember user preferences, sessions, and interactions with websites.": "Cookie",
  "A single network infrastructure that carries multiple types of communication services, such as data, voice, and video, over a common platform, increasing efficiency and reducing costs.": "Converged Network",
  "A unique numerical label assigned to each device connected to a computer network using the Internet Protocol for communication and identification purposes.": "Internet Protocol Address",
  "Publicity and exposure gained through word-of-mouth, social sharing, media coverage, or other unpaid channels, resulting from positive brand mentions, reviews, or endorsements.": "Earned Media",
  "Digital assets and channels controlled by a brand or organization, such as websites, blogs, social media profiles, and email newsletters, used for content marketing and branding.": "Owned Media",
  "A technology that uses radio waves to automatically identify and track objects, animals, or people by attaching tags or labels to them, enabling real-time monitoring and inventory management.": "Radio Frequency Identification (RFID)",
  "A decentralized hierarchical naming system that translates domain names into IP addresses to facilitate communication between computers and devices on the internet.": "Domain Name System (DNS)",
  "Small invisible graphics embedded in web pages or emails to monitor user behavior, track page views, and gather data for analytics and marketing purposes.": "Web Beacons",
  "The model of computing where processing, storage, and applications are performed on the client-side device (e.g., PC, smartphone), rather than on a centralized server.": "Client Computing",
  "Step-by-step procedures or sets of rules designed to perform specific tasks or solve problems, often used in computer science and mathematics to process data and make decisions.": "Algorithms"
};

// --- 狀態管理 ---
const currentView = ref('quiz'); // quiz, reference, result
const userAnswers = ref({});     // 儲存使用者輸入的 ID
const shuffledQuestions = ref([]);
const errors = ref([]);
const quizLimit = ref(100); // 預設 100 題
const pendingQuestion = ref(null); // 紀錄目前點擊「選取」按鈕的是哪一題題目文字

// --- 邏輯處理 ---

// 1. 產生排序後的答案清單 (計算屬性)
const sortedAnswers = computed(() => {
  const uniqueAnswers = [...new Set(Object.values(rawData))].sort();
  return uniqueAnswers.map((text, index) => ({
    id: index + 1,
    text: text
  }));
});

// 2. 初始化/洗牌題目
const initQuiz = () => {
  const questions = Object.entries(rawData).map(([q, a]) => {
    const correctInfo = sortedAnswers.value.find(ans => ans.text === a);
    return {
      question: q,
      correctId: correctInfo.id,
      correctText: a
    };
  });
  // 隨機排序
  shuffledQuestions.value = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, quizLimit.value);
  // 清空輸入
  userAnswers.value = {};
};

// 3. 提交檢查
const submitQuiz = () => {
  errors.value = [];
  shuffledQuestions.value.forEach(q => {
    const userVal = userAnswers.value[q.question];
    if (userVal !== q.correctId) {
      errors.value.push({
        q: q.question,
        userVal: userVal,
        correctId: q.correctId,
        correctText: q.correctText
      });
    }
  });
  currentView.value = 'result';
};

// 4. 重新開始
const restart = () => {
  initQuiz();
  currentView.value = 'quiz';
};

//選取按鈕
const goToPick = (questionText) => {
  pendingQuestion.value = questionText; // 紀錄題目
  currentView.value = 'reference';      // 跳轉到對照表
};

const pickAnswer = (ansId) => {
  if (pendingQuestion.value) {
    // 將 ID 填入對應的題目答案中
    userAnswers.value[pendingQuestion.value] = ansId;
    // 重置紀錄並跳回測驗
    pendingQuestion.value = null;
    currentView.value = 'quiz';
  }
};

watch(currentView, (newView) => {
  if (newView === 'reference') {
    // 鎖定背景滾動
    document.body.style.overflow = 'hidden';
  } else {
    // 恢復背景滾動
    document.body.style.overflow = 'auto';
  }
});
onMounted(initQuiz);
</script>

<style scoped>
.quiz-app {
  font-family: 'PingFang TC', sans-serif;
  background-color: #ffffff;
  padding: 0;
  display: block;
  flex-direction: column;
  align-items: center;
  width: 90vw; 
  height: fit-content;
}

.container {
  width: 95%;
  background: #dadada;
  padding: 25px;
  border-radius: 12px;
  
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  border-radius: 12px;
  margin-bottom: 40px; /* 底部留白 */
}

.container.ans {
  width: 96%;
  max-width: 1600px;
  /* 讓對照表高度固定在視窗內，超過則內部滾動 */
  max-height: calc(100vh - 100px); 
  overflow-y: auto; 
  margin: 10px auto;
}

body {
  margin: 0;
  padding: 0;
}

.res{
  background-color: #ececec;
}

/* 導覽列*/
.check-bar{
  position: sticky;
  top: 0;
  z-index: 1000;    /* 確保在所有題目上方 */
  width: 95vw; 
  background: #ffffff; /* 固定條的背景色，避免文字重疊 */
  padding: 0;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 0 rgba(0,0,0,0.05);

  margin-bottom: 20px;
}

.setup-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px;
}
/* 按鈕 */
.btn {
  margin: 0 20px 0 20px;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.btn-ref {
  background: #4a90e2; color: white;
  margin: 20px 0;
  height: 100%;
}
.btn-back { background: #f0f0f0; color: #666; margin-bottom: 15px; }
.btn-submit { background: #2ecc71; color: white; font-size: 1.1em; margin: 20px 10px; }
.btn:hover { opacity: 0.9; transform: translateY(-1px); }
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
}
/* 題目列表 */
.quiz-item {
  justify-content: flex-start;
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.id-input {
  width: 60px;
  padding: 8px;
  text-align: center;
  border: 1px solid #989898;
  border-radius: 4px;
  background-color: #f1f1f1;
  color: #000000;
  font-weight: bold;
}
.id-input::-webkit-outer-spin-button,
.id-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.q-text {
  flex: 1;             /* 讓文字佔滿左邊剩餘空間 */
  text-align: left;    /* 題目向左對齊 */
  line-height: 1.5;
  padding-right: 20px; /* 與輸入框保持距離 */
}

/* 答案對照表 */
.answer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  width: 100%;
  gap: 10px;
}
.ans{
  background-color: #9e9e9e;
}
.answer-card {
  color: #131313;
  padding: 8px 12px;
  min-height: 60px;
  background: #e0e0e0;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  min-height: 50px;
  word-break: break-all;
}
.answer-card:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}
.id-badge { 
  color: #4a90e2; 
  font-size: 0.75em; 
  font-weight: bold; 
  margin-bottom: 2px;
}
.ans-text { font-size: 1em; }

/* 結果顯示 */
.error-item {
  color:black;
  background: #fff5f5;
  border-left: 4px solid #ff6b6b;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}
.text-red { color: #e74c3c; font-weight: bold; }
.text-green { color: #27ae60; font-weight: bold; }
.success-msg { color: #27ae60; text-align: center; font-size: 1.2em; font-weight: bold; }

.btn-pick {
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  width: 35px;
  height: 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.btn-pick:hover {
  background: #357abd;
}

/* 讓對照表卡片有「可點擊」的感覺 */
.answer-card.pickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.answer-card.pickable:hover {
  background: #bbbbbb; /* 顏色變深一點點 */
  border-bottom: 3px solid #2ecc71; /* 滑過時顯示綠色邊框 */
  transform: scale(1.02);
}
</style>
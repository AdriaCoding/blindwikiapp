\LoadClass[11pt,twoside]{article}
\NeedsTeXFormat{LaTeX2e}

% \ProvidesClass{reportsascm}[2014/06/25 Estil de la revista reportsascm] 
%  Aquesta comanda causa warnings i no sembla pas necessària.

\RequirePackage{xcolor}
\RequirePackage{graphicx}
\RequirePackage{hyperref}
\hypersetup{citecolor=blue}
\RequirePackage{lastpage}
\RequirePackage{sfmath}
\definecolor{blau}{RGB}{43,129,173}
\definecolor{gris}{RGB}{100,100,100}
%Marges
\usepackage[a4paper,left=20mm,top=20mm,right=20mm,bottom=18mm,includeheadfoot,headheight=10mm, headsep=0mm, footskip=15mm]{geometry}
\makeatletter
%Parametres de la pagina
\hypersetup{colorlinks=true,urlcolor=black,linkcolor=blue}
%Definim les variables numero, any, pagin, pagfin, doi, ...
\def\l@any{????}
\def\l@numero{??}
\def\l@pagin{1}
\def\l@pagfin{\pageref*{LastPage}}
\def\l@doi{???????????}
\def\l@abstractcat{Sense abstract}
\def\@nymsc{2010}
\def\@rebut{\today}
\def\@acceptat{\today}
\newcommand{\any}[1]{\def\l@any{#1}}
\newcommand{\numero}[1]{\def\l@numero{#1}}
\newcommand{\pagin}[1]{\def\l@pagin{#1}\setcounter{page}{#1}}
\newcommand{\pagfin}[1]{\def\l@pagfin{#1}}
\newcommand{\doi}[1]{\def\l@doi{#1}}

\def\@msc{}
\def\@graiments{}
\def\@paraulesclau{}
\def\l@abstractceng{No abstract}
\def\l@authorStudent{No abstract}
\def\l@supervisors{No abstract}
\newcommand{\abstracteng}[1]{\def\l@abstracteng{#1}}
\newcommand{\authorStudent}[1]{\def\l@authorStudent{#1}}
\newcommand{\supervisors}[1]{\def\l@supervisors{#1}}
\newcommand{\monthYear}[1]{\def\l@monthYear{#1}}
\newcommand{\agraiments}[1]{\def\@graiments{#1}}
\newcommand{\paraulesclau}[1]{\def\@paraulesclau{#1}}
\newcommand{\titol}[1]{\title{#1}\def\@ltitle{#1}}
\def\@ltitleshort{\@ltitle}
\newcommand{\titolcurt}[1]{\def\@ltitleshort{#1}}


\newcommand{\abstractcat}[1]{\def\l@abstractcat{#1}}
\newcommand{\rebut}[1]{\def\@rebut{#1}}
\newcommand{\acceptat}[1]{\def\@acceptat{#1}}
%Modifiquem el títol i fem la portada
\def\s@lt{\vskip 2mm plus 2mm}
\def\s@ltet{\vskip 1mm plus 1mm}

\def\@maketitle{%
%\setlength{\unitlength}{1mm}%
\thispagestyle{empty}

\includepdf[pages=-]{portada.pdf}

\newpage\null
\thispagestyle{empty}

\newpage \null
\thispagestyle{empty}
\@graiments

\newpage \null \thispagestyle{empty} \newpage
\clearpage
\setcounter{page}{1}

\noindent
{\Large\bf Abstract}\\[1em]
\l@abstracteng\\[2cm]
{\large\bf Keywords}\\[1em]
\@paraulesclau

\newpage
}

% Guardem els autors a les variables
%
%\newcounter{num@utors}\setcounter{num@utors}{0}
%\newcommand{\autor}[1]{\author{#1}\addtocounter{num@utors}{1}\expandafter\def\csname @lautor\thenum@utors\endcsname{#1}}
%\newcommand{\univautor}[1]{\expandafter\def\csname l@univautor\thenum@utors\endcsname{#1}}
%\newcommand{\emailautor}[1]{\expandafter\def\csname l@emailautor\thenum@utors\endcsname{#1}}
%
\newcounter{num@utors}\setcounter{num@utors}{0}
\newcommand{\autor}[1]{\author{#1}\addtocounter{num@utors}{1}\expandafter\def\csname @lautor\thenum@utors\endcsname{#1}\expandafter\def\csname @pautor\thenum@utors\endcsname{#1}}
\newcommand{\corrautor}[1]{\author{#1}\addtocounter{num@utors}{1}\expandafter\def\csname @lautor\thenum@utors\endcsname{#1}\expandafter\def\csname @pautor\thenum@utors\endcsname{${}^\ast$#1}}
\newcommand{\univautor}[1]{\expandafter\def\csname l@univautor\thenum@utors\endcsname{#1}}
\newcommand{\emailautor}[1]{\expandafter\def\csname l@emailautor\thenum@utors\endcsname{#1}}

%%Caps de pagina i peus (E/O (even/odd), L/C/R (left/center/right) y H/F (header/footer))
\RequirePackage{fancyhdr}
\newcommand{\titlebox}{\makebox[170mm][r]{\@title}}
\renewcommand{\headrulewidth}{0pt}
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[RO]{\setlength{\unitlength}{1mm}%
\begin{picture}(0,0)
    \put(-20,-3){\makebox[20mm][r]{\it\thepage}}
\end{picture}}

\fancyfoot[RE]{\setlength{\unitlength}{1mm}%
\begin{picture}(0,0)
    \put(-170,-3){\makebox[20mm][l]{\it\thepage}}
\end{picture}}
%Seccions i altres
\RequirePackage{titlesec}
\titleformat{\section}
          {\normalfont\Huge\bfseries} 
          {\thesection.}
          {1ex \@plus.2ex}
          {}
\titleformat{\subsection}
          {\normalfont\LARGE\bfseries} 
          {\LARGE\thesubsection}
          {1ex \@plus.2ex}
          {}
\titleformat{\subsubsection}
          {\normalfont\Large\bfseries} 
          {\Large\thesubsubsection}
          {1ex \@plus.2ex}
          {}
\titleformat{\paragraf}
          {\normalfont\normalsize\bfseries} 
          {\normalsize\thesubsection}
          {1ex \@plus.2ex}
          {}
\titleformat{\subparagraf}
          {\normalfont\normalsize\bfseries} 
          {\normalsize\thesubsection}
          {1ex \@plus.2ex}
          {}

% \renewcommand\paragraph{\@startsection{paragraph}{4}{\z@}%
%                                     {3.25ex \@plus1ex \@minus.2ex}%
%                                     {-1em}%
%                                     {\normalfont\normalsize\bfseries}}
% \renewcommand\subparagraph{\@startsection{subparagraph}{5}{\parindent}%
%                                        {3.25ex \@plus1ex \@minus .2ex}%
%                                        {-1em}%                                     
%                                        {\normalfont\normalsize\bfseries}}
% No te indentacio i te separacio entre paragrafs
\setlength{\parskip}{1mm}
%\setlength{\parindent}{0pt}
% Modifiquem les fonts
%\renewcommand*{\familydefault}{\sfdefault}
%\renewcommand{\normalsize}{\fontsize{12pt}{14pt}\selectfont}

% Modifiquem la bibliografia
\usepackage{multicol}
\usepackage{etoolbox}
%\patchcmd{\thebibliography}{\section*{\refname}}
%   {\begin{multicols}{2}[\section*{\refname}]}{}{}
%\patchcmd{\endthebibliography}{\endlist}{\endlist\end{multicols}}{}{}
%\renewcommand\@biblabel[1]{#1.}
%\makeatother

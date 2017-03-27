var topicMap;
var searchMap;
var articleTemplate;
var currentTopic = 'Current';

function initTopics() {
    topicMap = {};
    searchMap = {};
    $.get("feeds/article-search.json", function (data) {
        data.forEach(function(article) {
            var topic = article.heading;
            searchMap[article.article_id] = article;
            if (!topicMap[topic]) {
                topicMap[topic] = {};
            }
            topicMap[topic][article.article_id] = article;
        });
    });
    $.get("tmpl/article-search-result.html", function(data) {
        articleTemplate = data;
    }, "html");
}

function changeTopic(topicName) {
    currentTopic = topicName;
    $('#current-topic').text(topicName);

    if (topicName === 'Current') {
        showCurrent();
        adjustRowHeight();
    } else {
        setResults(topicMap[topicName]);
    }
}

/**
 * Perform a search when the input field changes.
 * Apply a timer to delay while typing
 */
var timer;
function search(input) {
    clearTimeout(timer);
    timer = setTimeout(function() {
        textSearch(input.value);
    }, 350);
}

/**
 * Perform a search on currently available content, display the results.
 * If the search string is less than the minimum length, display the current
 * topic.
 * @param {String} searchStr Minimum length 3
 */
function textSearch(searchStr) {
    if (searchStr.length >= 3) {
        var results = [];
        for (articleId in searchMap) {
            var article = searchMap[articleId];
            if (articleMatches(article, searchStr)) {
                results.push(article);
            }
        }
        setResults(results);
    } else {
        changeTopic(currentTopic);
    }
}

function articleMatches(article, searchStr) {
    searchStr = searchStr.toUpperCase();
    return (article.search && article.search.includes(searchStr));
}

/**
 * Clear the search results, repopulate with the articles provided
 * @param {array} articles Articles to display in the search result area
 */
function setResults(articles) {
    $('#search-result').children().remove();
    showResult();
    if (articles.length > 0) {
        for (var articleId in articles) {
            var article = articles[articleId];
            loadArticle(article.url, function(data){
                articleMap[data.article_id] = data;
                var html = populateTemplate(articleTemplate, data)
                $('#search-result').append(html);
                if (!data.img) {
                    // need to hide blank images on some browsers
                    $('#'+data.article_id+' .card-media-panel img').hide();
                }
            })
        };
    } else {
        $('#search-result').append('<p class="empty-search">No results found.</p>');
    }
}

/**
 * Show the #article-cards div
 */
function showCurrent() {
    showArticle(false);
    $('#search-result').css('display', 'none');
    $('#article-cards').css('display', 'block');
}
/**
 * Show the #serarch-result div
 */
function showResult() {
    showArticle(false);
    $('#article-cards').css('display', 'none')
    $('#search-result').css('display', 'block');
}

$().ready(function() { initTopics(); });
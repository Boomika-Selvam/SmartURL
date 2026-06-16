const { URL } = require('url');
const Url = require('../models/Url');

const reservedAliases = new Set([
  'api',
  'auth',
  'urls',
  'login',
  'register',
  'dashboard',
  'admin',
  'assets'
]);

const topicWords = {
  chatgpt: ['chatgpt', 'ai-chat', 'openai', 'chatbot', 'smart-ai'],
  openai: ['openai', 'ai-chat', 'chatbot', 'smart-ai', 'gpt'],
  youtube: ['youtube', 'video', 'watch', 'creator', 'stream'],
  github: ['github', 'code', 'repo', 'dev-link', 'project'],
  linkedin: ['linkedin', 'profile', 'career', 'network', 'work'],
  google: ['google', 'search', 'web', 'find', 'smart-search'],
  amazon: ['amazon', 'shop', 'deal', 'store', 'buy-now'],
  medium: ['medium', 'article', 'blog', 'read', 'story']
};

const cleanPart = (value) => {
  return value
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28);
};

const normalizeAlias = (alias) => cleanPart(alias);

const getUrlParts = (longUrl) => {
  const parsed = new URL(longUrl);
  const hostParts = parsed.hostname.replace(/^www\./, '').split('.');
  const domain = cleanPart(hostParts[0] || 'link');

  const ignoredParams = new Set([
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid'
  ]);

  const pathWords = parsed.pathname
    .split('/')
    .filter(Boolean)
    .map((item) => cleanPart(item))
    .filter((item) => item && item.length > 2);

  const queryWords = [];
  parsed.searchParams.forEach((value, key) => {
    if (!ignoredParams.has(key)) {
      queryWords.push(cleanPart(key));
      queryWords.push(cleanPart(value));
    }
  });

  return {
    domain,
    keywords: [...pathWords, ...queryWords].filter(Boolean)
  };
};

const uniqueList = (items) => {
  return [...new Set(items.filter(Boolean))];
};

const makeSuggestions = (longUrl) => {
  const { domain, keywords } = getUrlParts(longUrl);
  const suggestions = [];

  if (topicWords[domain]) {
    suggestions.push(...topicWords[domain]);
  }

  suggestions.push(domain);

  keywords.slice(0, 4).forEach((word) => {
    suggestions.push(word);
    suggestions.push(`${domain}-${word}`.slice(0, 28));
  });

  suggestions.push(`${domain}-link`, `go-${domain}`, `my-${domain}`);

  return uniqueList(suggestions.map(cleanPart)).slice(0, 5);
};

const isValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (error) {
    return false;
  }
};

const suggestAliases = async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl || !isValidUrl(longUrl)) {
    return res.status(400).json({ message: 'Please provide a valid http or https URL' });
  }

  try {
    const baseSuggestions = makeSuggestions(longUrl);
    const aliases = [];

    for (const alias of baseSuggestions) {
      const exists = await Url.exists({ alias });
      aliases.push(exists ? `${alias}-${Math.floor(100 + Math.random() * 900)}` : alias);
    }

    return res.json({ suggestions: uniqueList(aliases).slice(0, 5) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create suggestions' });
  }
};

const createShortUrl = async (req, res) => {
  const { longUrl, alias } = req.body;

  if (!longUrl || !isValidUrl(longUrl)) {
    return res.status(400).json({ message: 'Please provide a valid http or https URL' });
  }

  const normalizedAlias = normalizeAlias(alias || '');

  if (!normalizedAlias || normalizedAlias.length < 3) {
    return res.status(400).json({ message: 'Alias must be at least 3 characters' });
  }

  if (reservedAliases.has(normalizedAlias)) {
    return res.status(400).json({ message: 'This alias is reserved. Please choose another one.' });
  }

  try {
    const duplicate = await Url.findOne({ alias: normalizedAlias });

    if (duplicate) {
      return res.status(409).json({ message: 'Alias already exists. Please choose another one.' });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const shortUrl = `${baseUrl}/${normalizedAlias}`;

    const createdUrl = await Url.create({
      user: req.user._id,
      originalUrl: longUrl,
      alias: normalizedAlias,
      shortUrl
    });

    return res.status(201).json({ url: createdUrl });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create short URL' });
  }
};

const getMyUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ urls });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load URLs' });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    await url.remove();
    return res.json({ message: 'URL deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete URL' });
  }
};

module.exports = {
  suggestAliases,
  createShortUrl,
  getMyUrls,
  deleteUrl
};


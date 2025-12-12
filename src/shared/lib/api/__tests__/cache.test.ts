import {
  TTLCache,
  studyCache,
  eventsCache,
  invalidateStudyCache,
} from "../cache";
import type {
  AssessmentStudyResponse,
  Event,
} from "../../../../domains/study/model/types";

describe("TTLCache", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("constructor", () => {
    it("should create cache with default TTL of 5 minutes", () => {
      const cache = new TTLCache<string>();
      expect(cache).toBeInstanceOf(TTLCache);
    });

    it("should create cache with custom TTL", () => {
      const cache = new TTLCache<string>(1000);
      expect(cache).toBeInstanceOf(TTLCache);
    });
  });

  describe("set and get", () => {
    it("should store and retrieve data", () => {
      const cache = new TTLCache<string>();
      cache.set("key1", "value1");

      expect(cache.get("key1")).toBe("value1");
    });

    it("should store and retrieve data with metadata", () => {
      const cache = new TTLCache<string>();
      cache.set("key1", "value1", { studyId: "study-001" });

      expect(cache.get("key1")).toBe("value1");
    });

    it("should return null for non-existent key", () => {
      const cache = new TTLCache<string>();
      expect(cache.get("nonexistent")).toBe(null);
    });

    it("should overwrite existing key", () => {
      const cache = new TTLCache<string>();
      cache.set("key1", "value1");
      cache.set("key1", "value2");

      expect(cache.get("key1")).toBe("value2");
    });
  });

  describe("TTL expiration", () => {
    it("should return data before TTL expires", () => {
      const cache = new TTLCache<string>(1000);
      cache.set("key1", "value1");

      jest.advanceTimersByTime(500);
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return null after TTL expires", () => {
      const cache = new TTLCache<string>(1000);
      cache.set("key1", "value1");

      jest.advanceTimersByTime(1001);
      expect(cache.get("key1")).toBe(null);
    });

    it("should delete expired entry from cache", () => {
      const cache = new TTLCache<string>(1000);
      cache.set("key1", "value1");

      jest.advanceTimersByTime(1001);
      cache.get("key1");
      expect(cache.get("key1")).toBe(null);
    });
  });

  describe("invalidate", () => {
    it("should invalidate entries matching filter function", () => {
      const cache = new TTLCache<string>();
      cache.set("key1", "value1", { studyId: "study-001" });
      cache.set("key2", "value2", { studyId: "study-001" });
      cache.set("key3", "value3", { studyId: "study-002" });

      cache.invalidate((_, metadata) => metadata?.studyId === "study-001");

      expect(cache.get("key1")).toBe(null);
      expect(cache.get("key2")).toBe(null);
      expect(cache.get("key3")).toBe("value3");
    });

    it("should invalidate entries by key pattern", () => {
      const cache = new TTLCache<string>();
      cache.set("study:001", "value1");
      cache.set("study:002", "value2");
      cache.set("events:001", "value3");

      cache.invalidate((key) => key.startsWith("study:"));

      expect(cache.get("study:001")).toBe(null);
      expect(cache.get("study:002")).toBe(null);
      expect(cache.get("events:001")).toBe("value3");
    });

    it("should clear all entries when filter is not provided", () => {
      const cache = new TTLCache<string>();
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      cache.invalidate();

      expect(cache.get("key1")).toBe(null);
      expect(cache.get("key2")).toBe(null);
    });

    it("should handle invalidate when no entries exist", () => {
      const cache = new TTLCache<string>();
      expect(() => cache.invalidate()).not.toThrow();
      expect(() => cache.invalidate(() => true)).not.toThrow();
    });
  });

  describe("clear", () => {
    it("should remove all entries from cache", () => {
      const cache = new TTLCache<string>();
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      cache.clear();

      expect(cache.get("key1")).toBe(null);
      expect(cache.get("key2")).toBe(null);
    });

    it("should handle clear when cache is empty", () => {
      const cache = new TTLCache<string>();
      expect(() => cache.clear()).not.toThrow();
    });
  });

  describe("complex data types", () => {
    it("should handle objects", () => {
      const cache = new TTLCache<{ name: string; age: number }>();
      const data = { name: "John", age: 30 };
      cache.set("key1", data);

      expect(cache.get("key1")).toEqual(data);
    });

    it("should handle arrays", () => {
      const cache = new TTLCache<number[]>();
      const data = [1, 2, 3];
      cache.set("key1", data);

      expect(cache.get("key1")).toEqual(data);
    });
  });

  describe("size and has", () => {
    it("should return correct cache size", () => {
      const cache = new TTLCache<string>();
      expect(cache.size()).toBe(0);

      cache.set("key1", "value1");
      expect(cache.size()).toBe(1);

      cache.set("key2", "value2");
      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it("should check if key exists and is not expired", () => {
      const cache = new TTLCache<string>(1000);
      cache.set("key1", "value1");

      expect(cache.has("key1")).toBe(true);
      expect(cache.has("nonexistent")).toBe(false);

      jest.advanceTimersByTime(1001);
      expect(cache.has("key1")).toBe(false);
    });
  });
});

describe("studyCache", () => {
  beforeEach(() => {
    studyCache.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should store and retrieve study data", () => {
    const studyData: AssessmentStudyResponse = {
      metadata: {
        study_id: "test-study-001",
        study_start: 0,
        study_end: 600,
      },
      signals: {},
      events: [],
    };

    studyCache.set("study:test-study-001", studyData, {
      studyId: "test-study-001",
    });
    expect(studyCache.get("study:test-study-001")).toEqual(studyData);
  });
});

describe("eventsCache", () => {
  beforeEach(() => {
    eventsCache.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should store and retrieve events", () => {
    const events: Event[] = [
      { id: "1", ts: 100, label: "Event 1" },
      { id: "2", ts: 200, label: "Event 2" },
    ];

    eventsCache.set("events:test-study-001", events, {
      studyId: "test-study-001",
    });
    expect(eventsCache.get("events:test-study-001")).toEqual(events);
  });
});

describe("invalidateStudyCache", () => {
  beforeEach(() => {
    studyCache.clear();
    eventsCache.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should invalidate both study and events cache for a studyId", () => {
    const studyData: AssessmentStudyResponse = {
      metadata: {
        study_id: "test-study-001",
        study_start: 0,
        study_end: 600,
      },
      signals: {},
      events: [],
    };

    const events: Event[] = [{ id: "1", ts: 100, label: "Event 1" }];

    studyCache.set("study:test-study-001", studyData, {
      studyId: "test-study-001",
    });
    eventsCache.set("events:test-study-001", events, {
      studyId: "test-study-001",
    });

    invalidateStudyCache("test-study-001");

    expect(studyCache.get("study:test-study-001")).toBe(null);
    expect(eventsCache.get("events:test-study-001")).toBe(null);
  });

  it("should only invalidate entries for the specified studyId", () => {
    const studyData1: AssessmentStudyResponse = {
      metadata: {
        study_id: "test-study-001",
        study_start: 0,
        study_end: 600,
      },
      signals: {},
      events: [],
    };

    const studyData2: AssessmentStudyResponse = {
      metadata: {
        study_id: "test-study-002",
        study_start: 0,
        study_end: 600,
      },
      signals: {},
      events: [],
    };

    studyCache.set("study:test-study-001", studyData1, {
      studyId: "test-study-001",
    });
    studyCache.set("study:test-study-002", studyData2, {
      studyId: "test-study-002",
    });

    invalidateStudyCache("test-study-001");

    expect(studyCache.get("study:test-study-001")).toBe(null);
    expect(studyCache.get("study:test-study-002")).toEqual(studyData2);
  });
});

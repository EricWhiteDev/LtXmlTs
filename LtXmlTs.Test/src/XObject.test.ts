import { describe, it, expect } from 'vitest';
import { XObject } from 'ltxmlts';

describe('XObject', () => {
  it('annotation returns the same object added via addAnnotation', () => {
    class Dummy {
      public description: string = '';
    }

    const myXObject = new XObject();
    const dummy = new Dummy();
    dummy.description = 'hello from Dummy';

    myXObject.addAnnotation(dummy);

    const result = myXObject.annotation(Dummy);

    expect(result).toBe(dummy);
    expect(result?.description).toBe('hello from Dummy');
  });

  it('annotation returns null when no matching type exists', () => {
    class Dummy { public description: string = ''; }
    class Other {}

    const myXObject = new XObject();
    myXObject.addAnnotation(new Dummy());

    expect(myXObject.annotation(Other)).toBeNull();
  });
});

describe('XObject.annotations', () => {
  it('returns all objects of the specified type', () => {
    class Tag {
      public label: string = '';
    }

    const myXObject = new XObject();
    const tag1 = new Tag(); tag1.label = 'first';
    const tag2 = new Tag(); tag2.label = 'second';

    myXObject.addAnnotation(tag1);
    myXObject.addAnnotation(tag2);

    const result = myXObject.annotations(Tag);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(tag1);
    expect(result[1]).toBe(tag2);
  });

  it('returns an empty array when no objects of the specified type exist', () => {
    class Tag { public label: string = ''; }
    class Other {}

    const myXObject = new XObject();
    myXObject.addAnnotation(new Tag());

    expect(myXObject.annotations(Other)).toEqual([]);
  });

  it('returns only objects of the specified type when multiple types are present', () => {
    class Tag { public label: string = ''; }
    class Note { public text: string = ''; }

    const myXObject = new XObject();
    const tag = new Tag(); tag.label = 'my-tag';
    const note = new Note(); note.text = 'my-note';

    myXObject.addAnnotation(tag);
    myXObject.addAnnotation(note);

    const tags = myXObject.annotations(Tag);
    expect(tags).toHaveLength(1);
    expect(tags[0]).toBe(tag);

    const notes = myXObject.annotations(Note);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toBe(note);
  });
});

describe('XObject.removeAnnotations', () => {
  it('no-arg overload clears all annotations', () => {
    class Tag { public label: string = ''; }
    class Note { public text: string = ''; }

    const myXObject = new XObject();
    myXObject.addAnnotation(new Tag());
    myXObject.addAnnotation(new Note());

    myXObject.removeAnnotations();

    expect(myXObject.annotations(Tag)).toEqual([]);
    expect(myXObject.annotations(Note)).toEqual([]);
  });

  it('typed overload removes only entries with exact constructor match', () => {
    class Tag { public label: string = ''; }
    class Note { public text: string = ''; }

    const myXObject = new XObject();
    const tag = new Tag();
    const note = new Note();
    myXObject.addAnnotation(tag);
    myXObject.addAnnotation(note);

    myXObject.removeAnnotations(Tag);

    expect(myXObject.annotations(Tag)).toEqual([]);
    expect(myXObject.annotations(Note)).toHaveLength(1);
    expect(myXObject.annotations(Note)[0]).toBe(note);
  });

  it('typed overload leaves subclass instances in place', () => {
    class Animal {}
    class Dog extends Animal {}

    const myXObject = new XObject();
    const dog = new Dog();
    myXObject.addAnnotation(dog);

    myXObject.removeAnnotations(Animal);

    expect(myXObject.annotations(Dog)).toHaveLength(1);
    expect(myXObject.annotations(Dog)[0]).toBe(dog);
  });
});

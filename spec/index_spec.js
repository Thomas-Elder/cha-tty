'use strict';

describe('Server',
  function(){
  
  it('Should pass this test because it doesn\'t test anything',
    function(done){
      done();
  });
  
  it('Should fail this test for funsies',
    function(done){
      expect(2).toEqual(3);
      done();
  });
});
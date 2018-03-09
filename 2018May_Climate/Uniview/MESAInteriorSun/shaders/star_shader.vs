in vec3 uv_vertexAttrib;

void main(void)
{
   gl_Position = vec4(uv_vertexAttrib, 1.0);
}
